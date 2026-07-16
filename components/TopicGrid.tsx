"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getMaxUnlockedTopic,
  MAX_TOPIC,
  UNLOCK_SCORE,
} from "@/lib/levels";
import { MODE_LABELS, type MathMode } from "@/lib/questions";

const TOPIC_COLORS = [
  "bg-coral hover:bg-coral-deep",
  "bg-sky hover:bg-sky-deep",
  "bg-mint hover:bg-mint-deep",
  "bg-grape hover:bg-grape-deep",
  "bg-sunshine hover:bg-sunshine-dark",
];

/**
 * Kisi topik dengan sistem level: topik di atas level tertinggi terkunci
 * (🔒) dan menampilkan syarat pembukanya; topik terbuka bisa dimainkan
 * ulang kapan saja untuk memperbaiki skor.
 */
export default function TopicGrid({ mode }: { mode: MathMode }) {
  const [maxUnlocked, setMaxUnlocked] = useState<number | null>(null);

  useEffect(() => {
    setMaxUnlocked(getMaxUnlockedTopic(mode));
  }, [mode]);

  const label = MODE_LABELS[mode];
  const symbol = mode === "perkalian" ? "×" : "÷";

  if (maxUnlocked === null) {
    return (
      <p className="py-8 text-center text-lg font-bold text-sky-deep">
        Membuka peta level… 🗺️
      </p>
    );
  }

  return (
    <>
      <p className="text-center text-sm font-bold text-night/50">
        Raih nilai {UNLOCK_SCORE} untuk membuka level berikutnya! 🔓
      </p>
      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-5">
        {Array.from({ length: MAX_TOPIC }, (_, i) => i + 1).map((topic) => {
          const unlocked = topic <= maxUnlocked;
          const isCurrent = topic === maxUnlocked && topic < MAX_TOPIC;
          const color = TOPIC_COLORS[(topic - 1) % TOPIC_COLORS.length];

          if (!unlocked) {
            return (
              <div
                key={topic}
                aria-disabled="true"
                title={`Terkunci — raih nilai ${UNLOCK_SCORE} di ${label} ${topic - 1}`}
                className="flex flex-col items-center justify-center gap-1 rounded-3xl bg-night/10 px-6 py-5 text-center select-none"
              >
                <span className="text-3xl" aria-hidden>
                  🔒
                </span>
                <span className="text-lg font-extrabold text-night/40">
                  {symbol} {topic}
                </span>
                <span className="text-[10px] font-bold leading-tight text-night/40">
                  nilai {UNLOCK_SCORE} di {label} {topic - 1}
                </span>
              </div>
            );
          }

          return (
            <motion.div
              key={topic}
              initial={false}
              animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.8 }}
            >
              <Link
                href={`/latihan/${mode}/${topic}`}
                className={`btn-pop w-full flex-col py-5 ${color}`}
              >
                <span className="text-3xl font-extrabold">
                  {symbol} {topic}
                </span>
                <span className="text-xs font-semibold opacity-90">
                  {isCurrent ? "⭐ Level saat ini" : "Bisa diulang"}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
