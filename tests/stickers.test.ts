/**
 * Uji logika tukar stiker terhadap Postgres in-memory (PGlite).
 * Jalankan: npm run test:stickers
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { users } from "../db/schema";
import {
  buyStickerDb,
  getStickerStateDb,
  spentStarsDb,
} from "../lib/server/stickers";

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

  // Buat anak dengan 30 bintang.
  const [user] = await db
    .insert(users)
    .values({
      name: "Sinta",
      className: "3B",
      schoolName: "SDN 1",
      pinHash: "x".repeat(64),
      totalStars: 30,
    })
    .returning();

  // Saldo awal 30, belum punya stiker.
  let state = await getStickerStateDb(db, user.id);
  assert.equal(state.balance, 30);
  assert.deepEqual(state.owned, []);
  console.log("✓ saldo awal 30, belum ada stiker");

  // Beli Kucing (5) → saldo 25, punya 1.
  let res = await buyStickerDb(db, user.id, "kucing");
  assert.ok(res.ok && res.state.balance === 25);
  assert.deepEqual(res.ok && res.state.owned, ["kucing"]);
  console.log("✓ beli Kucing (5) → saldo 25");

  // Beli lagi Kucing → ditolak (sudah punya).
  res = await buyStickerDb(db, user.id, "kucing");
  assert.ok(!res.ok && /sudah kamu miliki/.test(res.error));
  console.log("✓ beli stiker yang sama ditolak");

  // Stiker tak dikenal ditolak.
  res = await buyStickerDb(db, user.id, "ngasal");
  assert.ok(!res.ok && /tidak ditemukan/.test(res.error));
  console.log("✓ stiker tak dikenal ditolak");

  // Beli yang kemahalan (Bintang Jatuh 60, saldo 25) → ditolak.
  res = await buyStickerDb(db, user.id, "bintang-jatuh");
  assert.ok(!res.ok && /belum cukup/.test(res.error));
  console.log("✓ beli tanpa bintang cukup ditolak");

  // Beli Panda (10) → saldo 15, spent 15.
  res = await buyStickerDb(db, user.id, "panda");
  assert.ok(res.ok && res.state.balance === 15);
  assert.equal(await spentStarsDb(db, user.id), 15);
  console.log("✓ beli Panda → saldo 15, total belanja 15");

  // Hapus user → stiker ikut terhapus (FK cascade).
  await db.delete(users).where(eq(users.id, user.id));
  assert.equal(await spentStarsDb(db, user.id), 0);
  console.log("✓ hapus user meng-cascade stiker");

  await client.close();
  console.log("\nSEMUA TES STICKER LULUS ✅");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
