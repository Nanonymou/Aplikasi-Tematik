/**
 * Katalog stiker — modul murni tanpa dependensi client/server, dipakai
 * bersama oleh UI (lib/stickers.ts) dan logika server (lib/server/stickers.ts)
 * agar daftar & harga tidak pernah tidak sinkron.
 */

export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  /** Harga dalam bintang. */
  price: number;
}

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

export function findSticker(id: string): Sticker | undefined {
  return STICKER_CATALOG.find((s) => s.id === id);
}
