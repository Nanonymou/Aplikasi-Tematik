/**
 * Uji logika Parental Gate server: buat soal + verifikasi jawaban.
 * Jalankan: npm run test:challenge
 */
import assert from "node:assert/strict";
import {
  angkaKeKata,
  createChallenge,
  verifyChallenge,
} from "../lib/server/challenge";

async function main() {
  // --- angka ke kata ---
  assert.equal(angkaKeKata(3), "tiga");
  assert.equal(angkaKeKata(10), "sepuluh");
  assert.equal(angkaKeKata(11), "sebelas");
  assert.equal(angkaKeKata(15), "lima belas");
  assert.equal(angkaKeKata(20), "dua puluh");
  assert.equal(angkaKeKata(23), "dua puluh tiga");
  assert.equal(angkaKeKata(39), "tiga puluh sembilan");
  console.log("✓ konversi angka ke kata");

  // --- soal tidak membocorkan jawaban ---
  const ch = await createChallenge();
  assert.ok(ch.nonce && ch.prompt && ch.signature);
  assert.ok(!("answer" in ch), "jawaban tidak boleh ada di token");
  assert.match(ch.prompt, /dikali/);
  console.log("✓ soal berisi nonce+prompt+signature, tanpa jawaban");

  // --- hitung jawaban benar dari prompt kata, lalu verifikasi ---
  const SATUAN: Record<string, number> = {
    nol: 0, satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5,
    enam: 6, tujuh: 7, delapan: 8, sembilan: 9,
  };
  const kataKeAngka = (s: string): number => {
    s = s.trim();
    if (s === "sepuluh") return 10;
    if (s === "sebelas") return 11;
    let m = s.match(/^(\w+) belas$/);
    if (m) return 10 + SATUAN[m[1]];
    m = s.match(/^(\w+) puluh(?: (\w+))?$/);
    if (m) return SATUAN[m[1]] * 10 + (m[2] ? SATUAN[m[2]] : 0);
    return SATUAN[s];
  };
  const [kiri, kanan] = ch.prompt.split(" dikali ");
  const answer = kataKeAngka(kiri) * kataKeAngka(kanan);

  assert.equal(await verifyChallenge(ch.nonce, ch.signature, answer), true);
  console.log("✓ jawaban benar terverifikasi");

  // --- jawaban salah / signature dirusak / nonce beda ditolak ---
  assert.equal(await verifyChallenge(ch.nonce, ch.signature, answer + 1), false);
  assert.equal(await verifyChallenge(ch.nonce, ch.signature + "00", answer), false);
  assert.equal(await verifyChallenge("nonce-lain", ch.signature, answer), false);
  assert.equal(await verifyChallenge("", "", answer), false);
  console.log("✓ jawaban salah & token dirusak ditolak");

  console.log("\nSEMUA TES CHALLENGE LULUS ✅");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
