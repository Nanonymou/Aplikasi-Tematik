import { eq, sql } from "drizzle-orm";
import { users } from "@/db/schema";
import type { DbClient } from "./auth";
import { spentStarsDb } from "./stickers";

/**
 * Ringkasan bintang anak: total didapat (users.total_stars), sudah
 * dibelanjakan untuk stiker, dan saldo tersisa (non-negatif).
 */
export interface StarSummary {
  earned: number;
  spent: number;
  balance: number;
}

export async function getStarSummaryDb(
  db: DbClient,
  userId: string,
): Promise<StarSummary> {
  const [row] = await db
    .select({ totalStars: users.totalStars })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const earned = row?.totalStars ?? 0;
  const spent = await spentStarsDb(db, userId);
  return { earned, spent, balance: Math.max(0, earned - spent) };
}

/**
 * Tambah bintang ke total anak (mis. setelah sesi latihan/kilat).
 * Dilakukan atomik di database agar aman dari balapan.
 */
export async function addStarsDb(
  db: DbClient,
  userId: string,
  amount: number,
): Promise<number> {
  const add = Math.max(0, Math.floor(amount));
  if (add === 0) {
    const s = await getStarSummaryDb(db, userId);
    return s.earned;
  }
  const [row] = await db
    .update(users)
    .set({ totalStars: sql`${users.totalStars} + ${add}` })
    .where(eq(users.id, userId))
    .returning({ totalStars: users.totalStars });
  return row?.totalStars ?? 0;
}
