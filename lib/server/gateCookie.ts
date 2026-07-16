/**
 * Cookie sesi Parental Gate — edge-safe (hanya Web Crypto, tanpa node:*),
 * dipakai bersama oleh middleware dan route handler.
 *
 * Nilai cookie: `${expiry}.${hmac(expiry)}`. Middleware bisa memvalidasi
 * tanpa database. Berlaku singkat (10 menit) supaya orang dewasa ditanya
 * lagi berkala.
 */

export const GATE_COOKIE = "bb-gate";
export const GATE_TTL_MS = 10 * 60 * 1000;

const GATE_SECRET =
  process.env.GATE_SECRET ?? "bintang-berhitung-gate-dev-secret";

async function hmacHex(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(GATE_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Buat nilai cookie gate yang berlaku sampai now+TTL. */
export async function createGateCookieValue(
  now: number = Date.now(),
): Promise<string> {
  const expiry = now + GATE_TTL_MS;
  return `${expiry}.${await hmacHex(String(expiry))}`;
}

/** Validasi nilai cookie gate: tanda tangan cocok & belum kedaluwarsa. */
export async function isGateCookieValid(
  value: string | undefined,
  now: number = Date.now(),
): Promise<boolean> {
  if (!value) return false;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return false;
  const expiryStr = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < now) return false;

  const expected = await hmacHex(expiryStr);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}
