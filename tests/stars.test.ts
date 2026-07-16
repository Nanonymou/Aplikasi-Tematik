/**
 * Uji API periksa bintang pengguna via PGlite.
 * Jalankan: npm run test:stars
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../db/schema";
import { users } from "../db/schema";
import { addStarsDb, getStarSummaryDb } from "../lib/server/stars";
import { buyStickerDb } from "../lib/server/stickers";

async function main() {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  const dir = join(import.meta.dirname, "..", "drizzle");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    for (const stmt of readFileSync(join(dir, file), "utf8").split(
      "--> statement-breakpoint",
    )) {
      await client.exec(stmt);
    }
  }
  console.log("✓ migrasi diterapkan");

  const [user] = await db
    .insert(users)
    .values({
      name: "Sinta",
      className: "3B",
      schoolName: "SDN 1",
      pinHash: "x".repeat(64),
    })
    .returning();

  // Awal: semua 0.
  let s = await getStarSummaryDb(db, user.id);
  assert.deepEqual(s, { earned: 0, spent: 0, balance: 0 });
  console.log("✓ ringkasan awal semua 0");

  // Tambah 25 bintang.
  const total = await addStarsDb(db, user.id, 25);
  assert.equal(total, 25);
  s = await getStarSummaryDb(db, user.id);
  assert.deepEqual(s, { earned: 25, spent: 0, balance: 25 });
  console.log("✓ tambah bintang → earned & balance 25");

  // Beli stiker Panda (10) → spent 10, balance 15.
  const buy = await buyStickerDb(db, user.id, "panda");
  assert.ok(buy.ok);
  s = await getStarSummaryDb(db, user.id);
  assert.deepEqual(s, { earned: 25, spent: 10, balance: 15 });
  console.log("✓ setelah beli stiker → spent 10, balance 15");

  // addStars negatif/0 tidak mengubah.
  assert.equal(await addStarsDb(db, user.id, -5), 25);
  assert.equal(await addStarsDb(db, user.id, 0), 25);
  console.log("✓ tambah bintang negatif/0 tidak mengubah total");

  await client.close();
  console.log("\nSEMUA TES STARS LULUS ✅");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
