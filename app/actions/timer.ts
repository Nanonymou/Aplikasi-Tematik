"use server";

import { db } from "@/db";
import {
  getTimerBestDb,
  isMathType,
  recordTimerResultDb,
  type TimerRecordResult,
} from "@/lib/server/timer";
import { getSessionUserId } from "@/lib/server/session";

export type RecordTimerResponse =
  | (TimerRecordResult & { ok: true })
  | { ok: false; error: string };

/** Catat skor tantangan kilat untuk anak yang sedang masuk. */
export async function recordTimerAction(input: {
  mathType: string;
  correct: number;
  wrong: number;
}): Promise<RecordTimerResponse> {
  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: "Masuk dulu ya!" };
  if (!isMathType(input.mathType))
    return { ok: false, error: "Mode tidak valid." };

  const result = await recordTimerResultDb(db, userId, {
    mathType: input.mathType,
    correct: input.correct,
    wrong: input.wrong,
  });
  return { ok: true, ...result };
}

/** Rekor kilat anak untuk sebuah mode. */
export async function timerBestAction(mathType: string): Promise<number> {
  const userId = await getSessionUserId();
  if (!userId || !isMathType(mathType)) return 0;
  return getTimerBestDb(db, userId, mathType);
}
