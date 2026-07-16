"use server";

import { db } from "@/db";
import {
  getUserByIdDb,
  loginUserDb,
  registerUserDb,
  type AuthResult,
  type PublicUser,
  type RegistrationInput,
} from "@/lib/server/auth";
import {
  clearSession,
  getSessionUserId,
  setSessionUserId,
} from "@/lib/server/session";

/**
 * Endpoint registrasi (Server Action): simpan data diri + PIN (di-hash),
 * lalu buat sesi lewat cookie httpOnly.
 */
export async function registerAction(
  input: RegistrationInput,
): Promise<AuthResult> {
  const result = await registerUserDb(db, input);
  if (result.user) {
    await setSessionUserId(result.user.id);
  }
  return result;
}

/**
 * Endpoint verifikasi PIN (Server Action): cocokkan Nama + PIN,
 * dengan kunci 30 detik setelah 5x salah, lalu buat sesi cookie.
 */
export async function loginAction(
  name: string,
  pin: string,
): Promise<AuthResult> {
  const result = await loginUserDb(db, name, pin);
  if (result.user) {
    await setSessionUserId(result.user.id);
  }
  return result;
}

/** Profil pengguna yang sedang masuk (dari cookie sesi), atau null. */
export async function currentUserAction(): Promise<PublicUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return getUserByIdDb(db, userId);
}

/** Keluar dari sesi saat ini (Switch User). */
export async function logoutAction(): Promise<void> {
  await clearSession();
}
