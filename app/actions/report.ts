"use server";

import { db } from "@/db";
import { buildWeeklyReportDb, type WeeklyReport } from "@/lib/server/report";
import { getSessionUserId } from "@/lib/server/session";

/** Laporan mingguan performa anak yang sedang masuk (atau null bila belum). */
export async function weeklyReportAction(): Promise<WeeklyReport | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return buildWeeklyReportDb(db, userId);
}
