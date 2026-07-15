"use server";

import { db } from "@/db";
import {
  buyStickerDb,
  getStickerStateDb,
  type BuyResult,
  type StickerState,
} from "@/lib/server/stickers";
import { getSessionUserId } from "@/lib/server/session";
import { STICKER_CATALOG, type Sticker } from "@/lib/stickerCatalog";

export interface ShopData {
  catalog: Sticker[];
  balance: number;
  owned: string[];
}

export interface CollectionData {
  /** Stiker yang sudah dimiliki, lengkap dengan info katalognya. */
  stickers: Sticker[];
  total: number; // jumlah seluruh stiker di katalog
  balance: number;
}

/** Daftar stiker toko + saldo + kepemilikan (satu panggilan untuk halaman toko). */
export async function shopDataAction(): Promise<ShopData> {
  const userId = await getSessionUserId();
  if (!userId) return { catalog: STICKER_CATALOG, balance: 0, owned: [] };
  const state = await getStickerStateDb(db, userId);
  return { catalog: STICKER_CATALOG, balance: state.balance, owned: state.owned };
}

/** Koleksi stiker yang dimiliki anak (untuk halaman profil). */
export async function collectionAction(): Promise<CollectionData> {
  const userId = await getSessionUserId();
  if (!userId)
    return { stickers: [], total: STICKER_CATALOG.length, balance: 0 };
  const state = await getStickerStateDb(db, userId);
  const ownedSet = new Set(state.owned);
  return {
    stickers: STICKER_CATALOG.filter((s) => ownedSet.has(s.id)),
    total: STICKER_CATALOG.length,
    balance: state.balance,
  };
}

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
