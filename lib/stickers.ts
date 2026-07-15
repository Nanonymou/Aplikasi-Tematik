import { loadSessionResults } from "./storage";
import { getCurrentUser } from "./users";

/**
 * Toko Stiker (PRD: Sistem Hadiah) — data tiruan di frontend.
 * Anak menukar bintang hasil latihan dengan stiker digital.
 * Saldo = total bintang dari sesi latihan − bintang yang sudah dibelanjakan.
 */

export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  /** Harga dalam bintang. */
  price: number;
}

/** Katalog stiker (data tiruan). */
export const STICKER_CATALOG: Sticker[] = [
  { id: "kucing", emoji: "🐱", name: "Kucing Manis", price: 5 },
  { id: "anjing", emoji: "🐶", name: "Anjing Lucu", price: 5 },
  { id: "panda", emoji: "🐼", name: "Panda Gemas", price: 10 },
  { id: "unicorn", emoji: "🦄", name: "Unicorn Ajaib", price: 15 },
  { id: "roket", emoji: "🚀", name: "Roket Ngebut", price: 15 },
  { id: "pelangi", emoji: "🌈", name: "Pelangi Ceria", price: 20 },
  { id: "eskrim", emoji: "🍦", name: "Es Krim Manis", price: 20 },
  { id: "dino", emoji: "🦖", name: "Dino Keren", price: 25 },
  { id: "putri", emoji: "👑", name: "Mahkota Raja", price: 30 },
  { id: "naga", emoji: "🐉", name: "Naga Sakti", price: 40 },
  { id: "piala", emoji: "🏆", name: "Piala Juara", price: 50 },
  { id: "bintang-jatuh", emoji: "🌠", name: "Bintang Jatuh", price: 60 },
];

const OWNED_KEY = "bintang-berhitung:stickers";

type OwnedMap = Record<string, string[]>; // userId -> stickerId[]

function loadOwnedMap(): OwnedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OWNED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Stiker milik anak yang sedang masuk. */
export function getOwnedStickers(): string[] {
  const user = getCurrentUser();
  if (!user) return [];
  return loadOwnedMap()[user.id] ?? [];
}

/** Bintang yang sudah dibelanjakan anak aktif. */
export function getSpentStars(): number {
  const owned = new Set(getOwnedStickers());
  return STICKER_CATALOG.filter((s) => owned.has(s.id)).reduce(
    (sum, s) => sum + s.price,
    0,
  );
}

/** Saldo bintang yang bisa dibelanjakan anak aktif. */
export function getStarBalance(): number {
  const earned = loadSessionResults().reduce((sum, s) => sum + s.stars, 0);
  return earned - getSpentStars();
}

/**
 * Tukar bintang dengan stiker.
 * @returns null kalau sukses, atau pesan error ramah anak.
 */
export function buySticker(stickerId: string): string | null {
  const user = getCurrentUser();
  if (!user) return "Masuk dulu yuk sebelum belanja stiker!";
  const sticker = STICKER_CATALOG.find((s) => s.id === stickerId);
  if (!sticker) return "Stiker ini tidak ditemukan.";
  if (getOwnedStickers().includes(stickerId))
    return "Stiker ini sudah kamu miliki! 😊";
  if (getStarBalance() < sticker.price)
    return "Bintangmu belum cukup. Ayo latihan lagi biar tambah! 💪";

  try {
    const map = loadOwnedMap();
    map[user.id] = [...(map[user.id] ?? []), stickerId];
    window.localStorage.setItem(OWNED_KEY, JSON.stringify(map));
  } catch {
    return "Waduh, gagal menyimpan. Coba lagi ya!";
  }
  return null;
}
