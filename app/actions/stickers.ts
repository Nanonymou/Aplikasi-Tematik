"use server";

import { db } from "@/db";
import {
  buyStickerDb,
  getStickerStateDb,
  type BuyResult,
  type StickerState,
} from "@/lib/server/stickers";
import { getSessionUserId } from "@/lib/server/session";

/** Saldo & kepemilikan stiker anak yang sedang masuk. */
export async function stickerStateAction(): Promise<StickerState | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return getStickerStateDb(db, userId);
}

/** Tukar bintang dengan stiker (untuk anak yang sedang masuk). */
export async function buyStickerAction(stickerId: string): Promise<BuyResult> {
  const userId = await getSessionUserId();
  if (!userId)
    return { ok: false, error: "Masuk dulu yuk sebelum belanja stiker!" };
  return buyStickerDb(db, userId, stickerId);
}
