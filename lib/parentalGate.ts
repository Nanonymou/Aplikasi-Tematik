/**
 * Parental Gate — tantangan logika sederhana untuk orang dewasa (PRD Fase 4).
 * Soalnya ditulis dengan angka BERBENTUK KATA dan perkalian dua digit,
 * supaya sulit ditebak/dibaca cepat oleh anak kecil tetapi mudah bagi
 * orang dewasa.
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

export interface GateChallenge {
  /** Pertanyaan dengan angka dalam kata, mis. "dua puluh tiga × empat". */
  prompt: string;
  answer: number;
}

/** Buat tantangan: (11–39) × (3–9), ditulis dalam kata. */
export function generateGateChallenge(): GateChallenge {
  const left = 11 + Math.floor(Math.random() * 29); // 11–39
  const right = 3 + Math.floor(Math.random() * 7); // 3–9
  return {
    prompt: `${angkaKeKata(left)} dikali ${angkaKeKata(right)}`,
    answer: left * right,
  };
}

// ---------- Status gerbang (per tab, hilang saat tab ditutup) ----------

const GATE_KEY = "bintang-berhitung:parent-gate-ok";
/** Lolos gate berlaku 10 menit — setelah itu orang dewasa ditanya lagi. */
const GATE_TTL_MS = 10 * 60 * 1000;

export function markGatePassed() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(GATE_KEY, String(Date.now()));
}

export function isGatePassed(): boolean {
  if (typeof window === "undefined") return false;
  const at = Number(window.sessionStorage.getItem(GATE_KEY));
  return Number.isFinite(at) && at > 0 && Date.now() - at < GATE_TTL_MS;
}

export function clearGate() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(GATE_KEY);
}
