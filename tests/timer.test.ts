/**
 * Uji API catat skor Mode Kilat via PGlite.
 * Jalankan: npm run test:timer
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../db/schema";
import { users } from "../db/schema";
import {
  getTimerBestDb,
  recordTimerResultDb,
} from "../lib/server/timer";

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

  // Rekor awal 0.
  assert.equal(await getTimerBestDb(db, user.id, "perkalian"), 0);

  // Sesi pertama: 5 benar → rekor baru, bonus 5.
  let r = await recordTimerResultDb(db, user.id, {
    mathType: "perkalian",
    correct: 5,
    wrong: 2,
  });
  assert.equal(r.previousBest, 0);
  assert.equal(r.isNewRecord, true);
  assert.equal(r.best, 5);
  assert.equal(r.bonusStars, 5);
  console.log("✓ sesi pertama jadi rekor, bonus = benar");

  // Sesi kedua lebih rendah (3) → bukan rekor, rekor tetap 5.
  r = await recordTimerResultDb(db, user.id, {
    mathType: "perkalian",
    correct: 3,
    wrong: 0,
  });
  assert.equal(r.isNewRecord, false);
  assert.equal(r.previousBest, 5);
  assert.equal(r.best, 5);
  console.log("✓ skor lebih rendah tidak menggeser rekor");

  // Sesi ketiga lebih tinggi (8) → rekor baru.
  r = await recordTimerResultDb(db, user.id, {
    mathType: "perkalian",
    correct: 8,
    wrong: 1,
  });
  assert.equal(r.isNewRecord, true);
  assert.equal(r.best, 8);
  console.log("✓ skor lebih tinggi jadi rekor baru");

  // Mode pembagian terpisah (rekor sendiri).
  assert.equal(await getTimerBestDb(db, user.id, "pembagian"), 0);
  r = await recordTimerResultDb(db, user.id, {
    mathType: "pembagian",
    correct: 4,
    wrong: 0,
  });
  assert.equal(r.isNewRecord, true);
  assert.equal(await getTimerBestDb(db, user.id, "perkalian"), 8);
  assert.equal(await getTimerBestDb(db, user.id, "pembagian"), 4);
  console.log("✓ rekor per-mode terpisah");

  // Input negatif dinormalisasi.
  r = await recordTimerResultDb(db, user.id, {
    mathType: "pembagian",
    correct: -3,
    wrong: -1,
  });
  assert.equal(r.correct, 0);
  assert.equal(r.wrong, 0);
  console.log("✓ input negatif dinormalisasi ke 0");

  await client.close();
  console.log("\nSEMUA TES TIMER LULUS ✅");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
