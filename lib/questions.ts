export type MathMode = "perkalian" | "pembagian";

export interface Question {
  /** Angka kiri pada soal, mis. 7 pada "7 × 3" atau 21 pada "21 ÷ 3" */
  left: number;
  /** Angka kanan pada soal */
  right: number;
  /** Jawaban yang benar */
  answer: number;
  /** Simbol operasi untuk ditampilkan */
  symbol: "×" | "÷";
}

export const QUESTIONS_PER_SESSION = 10;

export const MODE_LABELS: Record<MathMode, string> = {
  perkalian: "Perkalian",
  pembagian: "Pembagian",
};

export function isMathMode(value: string): value is MathMode {
  return value === "perkalian" || value === "pembagian";
}

export function isValidTopic(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 10;
}

/** Acak urutan array (Fisher–Yates) tanpa mengubah array asli. */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Satu soal acak untuk mode tertentu (dipakai Mode Kilat). */
export function randomQuestion(mode: MathMode): Question {
  const a = 1 + Math.floor(Math.random() * 10); // 1–10
  const b = 1 + Math.floor(Math.random() * 10); // 1–10
  if (mode === "perkalian") {
    return { left: a, right: b, answer: a * b, symbol: "×" };
  }
  // Pembagian selalu bulat: (a*b) ÷ b = a.
  return { left: a * b, right: b, answer: a, symbol: "÷" };
}

/**
 * Buat 10 soal untuk satu topik.
 * - Perkalian topik 3 → "3 × 1" sampai "3 × 10" (diacak).
 * - Pembagian topik 3 → "3 ÷ 3" sampai "30 ÷ 3" (diacak), hasil selalu bulat.
 */
export function generateQuestions(mode: MathMode, topic: number): Question[] {
  const numbers = shuffle(
    Array.from({ length: QUESTIONS_PER_SESSION }, (_, i) => i + 1),
  );

  return numbers.map((n) => {
    if (mode === "perkalian") {
      return { left: topic, right: n, answer: topic * n, symbol: "×" as const };
    }
    return { left: topic * n, right: topic, answer: n, symbol: "÷" as const };
  });
}
