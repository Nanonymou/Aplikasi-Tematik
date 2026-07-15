"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MASTERY_SCORE, type TopicPerformance } from "@/lib/report";

/**
 * Grafik batang horizontal: rata-rata nilai per topik minggu ini.
 * Bentuk = perbandingan magnitude, satu hue (sky). Ada garis acuan
 * penguasaan (80) dan label nilai langsung di ujung batang.
 * Batang di atas/bawah ambang dibedakan warna + ikon (bukan warna saja).
 */

// Warna tervalidasi (skrip dataviz): kontras >=3:1 di kartu putih,
// pasangan lolos CVD dengan secondary encoding (ikon 🌟 + label + garis acuan).
const BAR = "#2b98d6";
const BAR_GOOD = "#1f7d5c";
const TRACK = "#e6eef4";

export default function TopicBarChart({
  topics,
}: {
  topics: TopicPerformance[];
}) {
  const [hover, setHover] = useState<string | null>(null);

  if (topics.length === 0) return null;

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="sr-only">
        Rata-rata nilai per topik minggu ini
      </figcaption>

      {/* Legend + garis acuan */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-night/50">
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ background: BAR_GOOD }}
            aria-hidden
          />
          🌟 Dikuasai (≥ {MASTERY_SCORE})
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ background: BAR }}
            aria-hidden
          />
          Sedang berkembang
        </span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {topics.map((t, i) => {
          const good = t.avgScore >= MASTERY_SCORE;
          const active = hover === t.label;
          return (
            <li
              key={t.label}
              className="flex items-center gap-2"
              onMouseEnter={() => setHover(t.label)}
              onMouseLeave={() => setHover(null)}
            >
              <span className="w-24 shrink-0 text-right text-xs font-bold text-night/70">
                {t.mode === "perkalian" ? "✖️" : "➗"} {t.topic}
              </span>
              {/* Track + batang */}
              <div className="relative h-6 flex-1 overflow-hidden rounded-lg" style={{ background: TRACK }}>
                {/* Garis acuan penguasaan (80) */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-night/25"
                  style={{ left: `${MASTERY_SCORE}%` }}
                  aria-hidden
                />
                <motion.div
                  className="flex h-full items-center justify-end rounded-lg pr-2"
                  style={{ background: good ? BAR_GOOD : BAR }}
                  initial={{ width: 0 }}
                  animate={{ width: `${t.avgScore}%` }}
                  transition={{ delay: i * 0.06, type: "spring", bounce: 0 }}
                >
                  <span className="text-[11px] font-extrabold text-white">
                    {t.avgScore}
                  </span>
                </motion.div>
              </div>
              <span
                className={`w-4 shrink-0 text-center text-sm ${active ? "" : "opacity-70"}`}
                aria-hidden
              >
                {good ? "🌟" : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
