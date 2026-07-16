"use server";

import { db } from "@/db";
import { getStarSummaryDb, type StarSummary } from "@/lib/server/stars";
import { getSessionUserId } from "@/lib/server/session";

/** Ringkasan bintang (didapat/dibelanjakan/saldo) anak yang sedang masuk. */
export async function starSummaryAction(): Promise<StarSummary | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return getStarSummaryDb(db, userId);
}
