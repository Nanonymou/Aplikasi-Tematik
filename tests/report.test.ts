/**
 * Uji API laporan mingguan (agregasi dari tabel sessions) via PGlite.
 * Jalankan: npm run test:report
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../db/schema";
import { sessions, users } from "../db/schema";
import { buildWeeklyReportDb } from "../lib/server/report";

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

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const mk = (
    mathType: string,
    topic: number,
    score: number,
    correct: number,
    daysAgo: number,
  ) => ({
    userId: user.id,
    mathType,
    topicNumber: topic,
    score,
    correctAnswers: correct,
    totalQuestions: 10,
    starsEarned: correct,
    createdAt: new Date(now - daysAgo * day),
  });

  await db.insert(sessions).values([
    // minggu ini
    mk("perkalian", 1, 100, 10, 1),
    mk("perkalian", 1, 90, 9, 2), // Perkalian 1 rata2 95 → dikuasai
    mk("pembagian", 3, 40, 4, 3), // butuh latihan
    mk("perkalian", 5, 70, 7, 1), // tengah
    // minggu lalu (10 hari): 1 sesi
    mk("pembagian", 1, 50, 5, 10),
    // di luar 2 minggu (20 hari): harus DIABAIKAN
    mk("perkalian", 9, 100, 10, 20),
  ]);

  const report = await buildWeeklyReportDb(db, user.id, now);

  assert.equal(report.totalSessions, 4);
  console.log("✓ hanya sesi 7 hari terakhir dihitung (4)");

  assert.equal(report.totalStars, 10 + 9 + 4 + 7);
  assert.equal(report.avgScore, Math.round((100 + 90 + 40 + 70) / 4)); // 75
  console.log("✓ total bintang & rata-rata nilai benar");

  const p1 = report.mastered.find((t) => t.label === "Perkalian 1");
  assert.ok(p1 && p1.avgScore === 95 && p1.attempts === 2 && p1.bestScore === 100);
  console.log("✓ Perkalian 1 (avg 95) di daftar dikuasai");

  assert.ok(report.needsPractice.some((t) => t.label === "Pembagian 3"));
  console.log("✓ Pembagian 3 (avg 40) di daftar butuh latihan");

  assert.ok(!report.allTopics.some((t) => t.label === "Perkalian 9"));
  console.log("✓ sesi lama (Perkalian 9) diabaikan");

  // delta vs minggu lalu (1 sesi, 5 bintang, avg 50)
  assert.equal(report.delta.sessions, 4 - 1);
  assert.equal(report.delta.stars, 30 - 5);
  assert.equal(report.delta.avgScore, 75 - 50);
  console.log("✓ delta vs minggu lalu benar");

  await client.close();
  console.log("\nSEMUA TES REPORT LULUS ✅");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
