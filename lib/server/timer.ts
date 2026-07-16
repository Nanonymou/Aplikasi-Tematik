import { and, desc, eq, sql } from "drizzle-orm";
import { timerResults } from "@/db/schema";
import type { DbClient } from "./auth";

/**
 * Logika Mode Kilat sisi server: catat skor + hitung rekor.
 */

export type MathType = "perkalian" | "pembagian";

export function isMathType(v: string): v is MathType {
  return v === "perkalian" || v === "pembagian";
}

export interface TimerRecordResult {
  correct: number;
  wrong: number;
  /** Rekor jawaban benar untuk mode ini (termasuk sesi ini). */
  best: number;
  /** Rekor sebelum sesi ini. */
  previousBest: number;
  isNewRecord: boolean;
  /** Bintang bonus = jawaban benar. */
  bonusStars: number;
}

/** Rekor jawaban benar terbanyak untuk mode tertentu. */
export async function getTimerBestDb(
  db: DbClient,
  userId: string,
  mathType: MathType,
): Promise<number> {
  const [row] = await db
    .select({
      best: sql<number>`coalesce(max(${timerResults.correctAnswers}), 0)`,
    })
    .from(timerResults)
    .where(
      and(eq(timerResults.userId, userId), eq(timerResults.mathType, mathType)),
    );
  return Number(row?.best ?? 0);
}

/** Catat hasil satu sesi kilat; kembalikan rekor & bonus. */
export async function recordTimerResultDb(
  db: DbClient,
  userId: string,
  input: { mathType: MathType; correct: number; wrong: number },
): Promise<TimerRecordResult> {
  const correct = Math.max(0, Math.floor(input.correct));
  const wrong = Math.max(0, Math.floor(input.wrong));

  const previousBest = await getTimerBestDb(db, userId, input.mathType);

  await db.insert(timerResults).values({
    userId,
    mathType: input.mathType,
    correctAnswers: correct,
    wrongAnswers: wrong,
  });

  return {
    correct,
    wrong,
    best: Math.max(previousBest, correct),
    previousBest,
    isNewRecord: correct > previousBest,
    bonusStars: correct,
  };
}

/** Riwayat kilat terbaru (untuk tampilan, opsional). */
export async function recentTimerResultsDb(
  db: DbClient,
  userId: string,
  limit = 10,
) {
  return db
    .select()
    .from(timerResults)
    .where(eq(timerResults.userId, userId))
    .orderBy(desc(timerResults.createdAt))
    .limit(limit);
}
