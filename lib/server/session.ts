import { cookies } from "next/headers";

/**
 * Sesi berbasis cookie httpOnly berisi id pengguna.
 * Sederhana sesuai kebutuhan aplikasi anak (PRD: "profil bisa disimpan…
 * dipasangkan dengan ID Cookie sederhana").
 */

const SESSION_COOKIE = "bb-user-id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setSessionUserId(userId: string) {
  (await cookies()).set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}

export async function getSessionUserId(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
