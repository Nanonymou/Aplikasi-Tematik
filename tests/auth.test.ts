/**
 * Uji logika registrasi terhadap Postgres sungguhan (PGlite in-memory).
 * Jalankan: npm run test:auth
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../db/schema";
import {
  findUserByNameDb,
  getUserByIdDb,
  hashPinServer,
  loginUserDb,
  MAX_PIN_ATTEMPTS,
  registerUserDb,
  validateRegistration,
} from "../lib/server/auth";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const client = new PGlite();
  const db = drizzle(client, { schema });

  // Terapkan SEMUA migrasi drizzle/ berurutan — sekaligus memvalidasi SQL-nya.
  const dir = join(import.meta.dirname, "..", "drizzle");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    const migration = readFileSync(join(dir, file), "utf8");
    for (const statement of migration.split("--> statement-breakpoint")) {
      await client.exec(statement);
    }
  }
  console.log("✓ migrasi diterapkan ke Postgres in-memory");

  // --- validasi murni ---
  assert.equal(validateRegistration({ name: "", className: "3B", schoolName: "SDN", pin: "2468" }), "Nama tidak boleh kosong.");
  assert.equal(validateRegistration({ name: "Sinta", className: "3B", schoolName: "SDN", pin: "24" }), "PIN harus 4 angka.");
  assert.match(validateRegistration({ name: "Sinta", className: "3B", schoolName: "SDN", pin: "7777" })!, /gampang ditebak/);
  assert.equal(validateRegistration({ name: "Sinta", className: "3B", schoolName: "SDN", pin: "2468" }), null);
  console.log("✓ validasi input registrasi");

  // --- registrasi sukses ---
  const result = await registerUserDb(db, {
    name: "  Sinta  ",
    className: "3B",
    schoolName: "SDN 1 Melati",
    pin: "2468",
  });
  assert.ok(result.user, `registrasi gagal: ${result.error}`);
  assert.equal(result.user.name, "Sinta"); // ter-trim
  assert.equal(result.user.totalStars, 0);
  assert.equal(result.user.avatarUrl, "⭐");
  assert.ok(result.user.id.match(/^[0-9a-f-]{36}$/));
  assert.ok(!("pinHash" in result.user), "pinHash tidak boleh bocor ke client");
  console.log("✓ registrasi menyimpan data diri, tanpa membocorkan pinHash");

  // --- PIN tersimpan sebagai hash yang benar ---
  const raw = await findUserByNameDb(db, "sinta");
  assert.ok(raw);
  assert.equal(raw.pinHash, hashPinServer("Sinta", "2468"));
  assert.notEqual(raw.pinHash.includes("2468"), true);
  console.log("✓ PIN tersimpan sebagai SHA-256, bukan teks polos");

  // --- nama kembar (beda kapital) ditolak ---
  const dup = await registerUserDb(db, {
    name: "SINTA",
    className: "2A",
    schoolName: "SD Lain",
    pin: "1357",
  });
  assert.match(dup.error!, /sudah dipakai/);
  console.log("✓ nama kembar (case-insensitive) ditolak");

  // --- ambil profil by id (pemulihan sesi cookie) ---
  const byId = await getUserByIdDb(db, result.user.id);
  assert.equal(byId?.name, "Sinta");
  assert.equal(await getUserByIdDb(db, "00000000-0000-0000-0000-000000000000"), null);
  console.log("✓ getUserByIdDb untuk pemulihan sesi");

  // ---------- verifikasi PIN (masuk) ----------

  // sukses, case-insensitive
  const login = await loginUserDb(db, "sInTa", "2468");
  assert.equal(login.user?.name, "Sinta");
  assert.ok(!("pinHash" in (login.user ?? {})));
  console.log("✓ masuk dengan Nama (case-insensitive) + PIN benar");

  // nama tak dikenal
  const noUser = await loginUserDb(db, "Ghost", "2468");
  assert.match(noUser.error!, /tidak ditemukan/);

  // PIN salah → pesan sisa kesempatan
  const wrong = await loginUserDb(db, "Sinta", "9999");
  assert.match(wrong.error!, /Sisa 4 kesempatan/);
  console.log("✓ PIN salah diberi sisa kesempatan");

  // 5x salah → terkunci; PIN benar pun ditolak
  for (let i = 0; i < MAX_PIN_ATTEMPTS; i++) await loginUserDb(db, "Sinta", "9999");
  const locked = await loginUserDb(db, "Sinta", "2468");
  assert.match(locked.error!, /Tunggu \d+ detik/);
  console.log("✓ terkunci setelah 5x salah, PIN benar pun ditolak");

  // kunci berakhir → masuk lagi & hitungan direset
  await db
    .update(users)
    .set({ lockedUntil: new Date(Date.now() - 1000) })
    .where(eq(users.id, result.user.id));
  const after = await loginUserDb(db, "Sinta", "2468");
  assert.equal(after.user?.name, "Sinta");
  const fresh = await findUserByNameDb(db, "Sinta");
  assert.equal(fresh!.failedAttempts, 0);
  assert.equal(fresh!.lockedUntil, null);
  console.log("✓ setelah kunci berakhir bisa masuk, hitungan direset");

  await client.close();
  console.log("\nSEMUA TES AUTH LULUS ✅");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
