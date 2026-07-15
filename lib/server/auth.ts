import { createHash } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "@/db/schema";
import { users, type User } from "@/db/schema";

/**
 * Logika autentikasi sisi server (dipakai Server Actions).
 * Fungsi menerima `db` sebagai parameter agar bisa diuji dengan
 * Postgres in-memory (PGlite) tanpa Vercel Postgres.
 */

export type DbClient = PgDatabase<PgQueryResultHKT, typeof schema>;

export const PIN_LENGTH = 4;

/** Profil aman untuk dikirim ke client — tanpa pin_hash. */
export type PublicUser = Omit<User, "pinHash">;

export function toPublicUser(user: User): PublicUser {
  const { pinHash: _pinHash, ...publicUser } = user;
  return publicUser;
}

/**
 * Hash PIN: SHA-256 dari `${nama-lowercase}:${pin}`.
 * Format sengaja sama dengan stub localStorage frontend supaya data lama
 * bisa dimigrasikan tanpa anak membuat PIN baru.
 */
export function hashPinServer(name: string, pin: string): string {
  return createHash("sha256")
    .update(`${name.trim().toLowerCase()}:${pin}`)
    .digest("hex");
}

export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

export function isWeakPin(pin: string): boolean {
  return /^(\d)\1+$/.test(pin);
}

export interface RegistrationInput {
  name: string;
  className: string;
  schoolName: string;
  pin: string;
}

/** Validasi murni — dipisah agar mudah diuji dan pesannya konsisten. */
export function validateRegistration(
  input: RegistrationInput,
): string | null {
  if (!input.name?.trim()) return "Nama tidak boleh kosong.";
  if (input.name.trim().length > 30) return "Nama terlalu panjang (maks 30).";
  if (!input.className?.trim()) return "Kelas tidak boleh kosong.";
  if (input.className.trim().length > 20)
    return "Kelas terlalu panjang (maks 20).";
  if (!input.schoolName?.trim()) return "Nama sekolah tidak boleh kosong.";
  if (input.schoolName.trim().length > 50)
    return "Nama sekolah terlalu panjang (maks 50).";
  if (!isValidPin(input.pin)) return `PIN harus ${PIN_LENGTH} angka.`;
  if (isWeakPin(input.pin))
    return "PIN dengan angka yang sama semua gampang ditebak. Pilih yang lain ya! 🕵️";
  return null;
}

export type AuthResult =
  | { user: PublicUser; error?: never }
  | { user?: never; error: string };

/** Cari pengguna berdasarkan nama (tidak peduli huruf besar/kecil). */
export async function findUserByNameDb(
  db: DbClient,
  name: string,
): Promise<User | undefined> {
  const rows = await db
    .select()
    .from(users)
    .where(sql`lower(${users.name}) = ${name.trim().toLowerCase()}`)
    .limit(1);
  return rows[0];
}

/** Registrasi: simpan data diri + hash PIN. Nama harus unik. */
export async function registerUserDb(
  db: DbClient,
  input: RegistrationInput,
): Promise<AuthResult> {
  const validationError = validateRegistration(input);
  if (validationError) return { error: validationError };

  const existing = await findUserByNameDb(db, input.name);
  if (existing)
    return {
      error: "Nama ini sudah dipakai. Kalau itu kamu, coba Masuk dengan PIN.",
    };

  try {
    const [user] = await db
      .insert(users)
      .values({
        name: input.name.trim(),
        className: input.className.trim(),
        schoolName: input.schoolName.trim(),
        pinHash: hashPinServer(input.name, input.pin),
      })
      .returning();
    return { user: toPublicUser(user) };
  } catch (err) {
    // Balapan dua pendaftaran nama sama → index unik menolak.
    if (err instanceof Error && /unique|duplicate/i.test(err.message)) {
      return {
        error: "Nama ini sudah dipakai. Kalau itu kamu, coba Masuk dengan PIN.",
      };
    }
    throw err;
  }
}

/** Ambil profil publik berdasarkan id (untuk memulihkan sesi dari cookie). */
export async function getUserByIdDb(
  db: DbClient,
  id: string,
): Promise<PublicUser | null> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ? toPublicUser(rows[0]) : null;
}
