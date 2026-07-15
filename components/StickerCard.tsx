"use client";

import { motion } from "framer-motion";
import type { Sticker } from "@/lib/stickers";

/**
 * Kartu satu stiker dengan tombol tukar (beli pakai bintang).
 * - Sudah dimiliki → badge "Milikku", stiker berwarna penuh.
 * - Belum dimiliki & bintang cukup → tombol harga aktif.
 * - Bintang kurang → tombol nonaktif (redup).
 */
export default function StickerCard({
  sticker,
  owned,
  affordable,
  onBuy,
}: {
  sticker: Sticker;
  owned: boolean;
  affordable: boolean;
  onBuy: (sticker: Sticker) => void;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-3xl p-4 text-center shadow-pop-sm ${
        owned ? "bg-mint/20" : "bg-white/85"
      }`}
    >
      <motion.span
        className={`text-5xl ${owned ? "" : "opacity-70 grayscale"}`}
        animate={owned ? { rotate: [0, -8, 8, 0] } : {}}
        transition={{ duration: 0.6 }}
        aria-hidden
      >
        {sticker.emoji}
      </motion.span>
      <span className="text-sm font-extrabold text-night">{sticker.name}</span>
      {owned ? (
        <span className="rounded-xl bg-mint px-3 py-1 text-xs font-extrabold text-white">
          ✓ Milikku
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onBuy(sticker)}
          disabled={!affordable}
          aria-label={`Tukar ${sticker.name} seharga ${sticker.price} bintang`}
          className="btn-pop w-full bg-sunshine px-3 py-2 text-sm text-night hover:bg-sunshine-dark disabled:opacity-40"
        >
          ⭐ {sticker.price}
        </button>
      )}
    </div>
  );
}
