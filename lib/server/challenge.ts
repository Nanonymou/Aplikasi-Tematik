/**
 * Logika Parental Gate sisi server: buat soal + verifikasi jawaban.
 * Angka ditulis dalam kata (bahasa Indonesia) supaya mudah bagi orang
 * dewasa, sulit bagi anak kecil. Murni & tanpa DOM agar mudah diuji.
 */

const SATUAN = [
  "nol",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
];

/** Tulis angka 0–99 dalam kata bahasa Indonesia. */
export function angkaKeKata(n: number): string {
  if (n < 10) return SATUAN[n];
  if (n === 10) return "sepuluh";
  if (n === 11) return "sebelas";
  if (n < 20) return `${SATUAN[n - 10]} belas`;
  const puluh = Math.floor(n / 10);
  const sisa = n % 10;
  const kataPuluh = `${SATUAN[puluh]} puluh`;
  return sisa === 0 ? kataPuluh : `${kataPuluh} ${SATUAN[sisa]}`;
}

export interface ChallengeToken {
  /** id acak; dipakai untuk membuat tanda tangan jawaban. */
  nonce: string;
  prompt: string;
  /** Tanda tangan HMAC jawaban — jawaban benar tidak dikirim ke client. */
  signature: string;
}

const GATE_SECRET =
  process.env.GATE_SECRET ?? "bintang-berhitung-gate-dev-secret";

async function hmac(message: string): Promise<string> {
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

/**
 * Buat tantangan baru: (11–39) × (3–9) ditulis dalam kata.
 * Jawaban benar TIDAK dikirim; sebagai gantinya tanda tangan HMAC dari
 * `${nonce}:${jawaban}` supaya verifikasi tetap stateless dan aman.
 */
export async function createChallenge(): Promise<ChallengeToken> {
  const left = 11 + Math.floor(Math.random() * 29);
  const right = 3 + Math.floor(Math.random() * 7);
  const answer = left * right;
  const nonce = crypto.randomUUID();
  return {
    nonce,
    prompt: `${angkaKeKata(left)} dikali ${angkaKeKata(right)}`,
    signature: await hmac(`${nonce}:${answer}`),
  };
}

/** Verifikasi jawaban terhadap nonce + signature (stateless). */
export async function verifyChallenge(
  nonce: string,
  signature: string,
  answer: number,
): Promise<boolean> {
  if (!nonce || !signature || !Number.isInteger(answer)) return false;
  const expected = await hmac(`${nonce}:${answer}`);
  // Perbandingan panjang tetap untuk cegah timing attack sederhana.
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}
