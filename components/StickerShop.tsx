"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  buySticker,
  getOwnedStickers,
  getStarBalance,
  STICKER_CATALOG,
} from "@/lib/stickers";
import { playCheer, playWomp } from "@/lib/sounds";

export default function StickerShop() {
  const [balance, setBalance] = useState<number | null>(null);
  const [owned, setOwned] = useState<string[]>([]);
  const [message, setMessage] = useState<{
    text: string;
    kind: "ok" | "err";
  } | null>(null);

  const refresh = () => {
    setBalance(getStarBalance());
    setOwned(getOwnedStickers());
  };

  useEffect(refresh, []);

  if (balance === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-2xl font-bold text-sky-deep">
        Membuka toko… 🛍️
      </div>
    );
  }

  const buy = (id: string, name: string) => {
    const error = buySticker(id);
    if (error) {
      setMessage({ text: error, kind: "err" });
      playWomp();
    } else {
      setMessage({ text: `Yeay! Stiker ${name} jadi milikmu! 🎉`, kind: "ok" });
      playCheer();
    }
    refresh();
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-5 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="rounded-2xl bg-white/70 px-4 py-2 text-sm font-bold text-night/70 shadow-pop-sm"
        >
          ← Beranda
        </Link>
        <h1 className="text-2xl font-extrabold text-sky-deep sm:text-3xl">
          🛍️ Toko Stiker
        </h1>
        <div
          className="flex items-center gap-1 rounded-2xl bg-white/85 px-4 py-2 font-extrabold text-sunshine-dark shadow-pop-sm"
          aria-label={`Saldo ${balance} bintang`}
        >
          ⭐ {balance}
        </div>
      </div>

      <p className="text-center text-sm font-bold text-night/50">
        Tukarkan bintang hasil latihanmu dengan stiker keren! Koleksi:{" "}
        {owned.length}/{STICKER_CATALOG.length}
      </p>

      <AnimatePresence>
        {message && (
          <motion.p
            key={message.text}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`rounded-2xl px-4 py-3 text-center text-sm font-bold ${
              message.kind === "ok"
                ? "bg-mint/20 text-mint-deep"
                : "bg-coral/15 text-coral-deep"
            }`}
            role="status"
          >
            {message.text}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {STICKER_CATALOG.map((sticker) => {
          const isOwned = owned.includes(sticker.id);
          const affordable = balance >= sticker.price;
          return (
            <div
              key={sticker.id}
              className={`flex flex-col items-center gap-2 rounded-3xl p-4 text-center shadow-pop-sm ${
                isOwned ? "bg-mint/20" : "bg-white/85"
              }`}
            >
              <span className="text-5xl" aria-hidden>
                {sticker.emoji}
              </span>
              <span className="text-sm font-extrabold text-night">
                {sticker.name}
              </span>
              {isOwned ? (
                <span className="rounded-xl bg-mint px-3 py-1 text-xs font-extrabold text-white">
                  ✓ Milikku
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => buy(sticker.id, sticker.name)}
                  disabled={!affordable}
                  className="btn-pop w-full bg-sunshine px-3 py-2 text-sm text-night hover:bg-sunshine-dark disabled:opacity-40"
                >
                  ⭐ {sticker.price}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
