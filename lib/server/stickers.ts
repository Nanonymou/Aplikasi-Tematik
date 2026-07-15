import { and, eq, sql } from "drizzle-orm";
import { userStickers, users } from "@/db/schema";
import { findSticker, STICKER_CATALOG } from "@/lib/stickerCatalog";
import type { DbClient } from "./auth";

/**
 * Logika Toko Stiker sisi server (dipakai Server Actions).
 * Saldo bintang = users.total_stars − total harga stiker yang dimiliki.
 */

export interface StickerState {
  balance: number;
  owned: string[]; // daftar sticker_id
}

/** Saldo & kepemilikan stiker anak. */
export async function getStickerStateDb(
  db: DbClient,
  userId: string,
): Promise<StickerState> {
  const [userRow] = await db
    .select({ totalStars: users.totalStars })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const earned = userRow?.totalStars ?? 0;

  const owned = await db
    .select({
      stickerId: userStickers.stickerId,
      price: userStickers.priceStars,
    })
    .from(userStickers)
    .where(eq(userStickers.userId, userId));

  const spent = owned.reduce((sum, s) => sum + s.price, 0);
  return {
    balance: Math.max(0, earned - spent),
    owned: owned.map((s) => s.stickerId),
  };
}

export type BuyResult =
  | { ok: true; state: StickerState }
  | { ok: false; error: string };

/** Tukar bintang dengan satu stiker (atomik & aman dari beli ganda). */
export async function buyStickerDb(
  db: DbClient,
  userId: string,
  stickerId: string,
): Promise<BuyResult> {
  const sticker = findSticker(stickerId);
  if (!sticker) return { ok: false, error: "Stiker ini tidak ditemukan." };

  const state = await getStickerStateDb(db, userId);
  if (state.owned.includes(stickerId))
    return { ok: false, error: "Stiker ini sudah kamu miliki! 😊" };
  if (state.balance < sticker.price)
    return {
      ok: false,
      error: "Bintangmu belum cukup. Ayo latihan lagi biar tambah! 💪",
    };

  try {
    // Index unik (user_id, sticker_id) mencegah pembelian ganda saat balapan.
    await db.insert(userStickers).values({
      userId,
      stickerId,
      priceStars: sticker.price,
    });
  } catch (err) {
    if (err instanceof Error && /unique|duplicate/i.test(err.message)) {
      return { ok: false, error: "Stiker ini sudah kamu miliki! 😊" };
    }
    throw err;
  }

  return { ok: true, state: await getStickerStateDb(db, userId) };
}

/** Katalog stiker (untuk dikirim ke client bila perlu). */
export function stickerCatalog() {
  return STICKER_CATALOG;
}

/** Query total belanja (dipakai laporan/test). */
export async function spentStarsDb(
  db: DbClient,
  userId: string,
): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${userStickers.priceStars}), 0)` })
    .from(userStickers)
    .where(and(eq(userStickers.userId, userId)));
  return Number(row?.total ?? 0);
}
