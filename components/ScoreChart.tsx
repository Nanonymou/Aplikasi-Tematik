"use client";

import { useMemo, useRef, useState } from "react";
import type { SessionResult } from "@/lib/storage";
import { MODE_LABELS } from "@/lib/questions";

/**
 * Grafik garis kemajuan nilai (0–100) per sesi latihan.
 * Satu seri, SVG tanpa library — garis 2px, titik >=8px,
 * grid resesif, crosshair + tooltip saat hover/sentuh.
 */

const CHART = {
  width: 640,
  height: 260,
  pad: { top: 16, right: 16, bottom: 28, left: 36 },
  line: "#2b98d6", // tervalidasi: kontras >=3:1 di atas kartu putih
  grid: "#e6eef4",
  ink: "#5b6472",
};

interface Props {
  sessions: SessionResult[];
}

export default function ScoreChart({ sessions }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const { width, height, pad } = CHART;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const points = useMemo(() => {
    const n = sessions.length;
    return sessions.map((s, i) => ({
      x: pad.left + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW),
      y: pad.top + (1 - s.score / 100) * plotH,
      session: s,
      index: i,
    }));
  }, [sessions, pad.left, pad.top, plotW, plotH]);

  if (sessions.length < 2) {
    return (
      <p className="py-10 text-center font-semibold text-night/50">
        Selesaikan minimal 2 sesi latihan untuk melihat grafik kemajuanmu 📈
      </p>
    );
  }

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  const onMove = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * width;
    let nearest = 0;
    let best = Infinity;
    for (const p of points) {
      const d = Math.abs(p.x - x);
      if (d < best) {
        best = d;
        nearest = p.index;
      }
    }
    setHover(nearest);
  };

  const active = hover !== null ? points[hover] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full touch-none select-none"
        role="img"
        aria-label="Grafik kemajuan nilai per sesi latihan"
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => onMove(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
      >
        {/* Grid horizontal resesif + label sumbu Y */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = pad.top + (1 - v / 100) * plotH;
          return (
            <g key={v}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke={CHART.grid}
                strokeWidth={1}
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                fill={CHART.ink}
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* Label sumbu X: sesi pertama & terakhir saja (selektif) */}
        <text
          x={points[0].x}
          y={height - 8}
          textAnchor="start"
          fontSize={11}
          fill={CHART.ink}
        >
          Sesi 1
        </text>
        <text
          x={points[points.length - 1].x}
          y={height - 8}
          textAnchor="end"
          fontSize={11}
          fill={CHART.ink}
        >
          Sesi {points.length}
        </text>

        {/* Crosshair */}
        {active && (
          <line
            x1={active.x}
            x2={active.x}
            y1={pad.top}
            y2={pad.top + plotH}
            stroke={CHART.ink}
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />
        )}

        {/* Garis data */}
        <path d={path} fill="none" stroke={CHART.line} strokeWidth={2} />

        {/* Titik data: >=8px, ring putih 2px */}
        {points.map((p) => (
          <circle
            key={p.index}
            cx={p.x}
            cy={p.y}
            r={hover === p.index ? 6 : 4}
            fill={CHART.line}
            stroke="#ffffff"
            strokeWidth={2}
          />
        ))}

        {/* Label langsung di titik terakhir saja */}
        <text
          x={points[points.length - 1].x}
          y={points[points.length - 1].y - 10}
          textAnchor="end"
          fontSize={12}
          fontWeight={700}
          fill={CHART.ink}
        >
          {sessions[sessions.length - 1].score}
        </text>
      </svg>

      {/* Tooltip */}
      {active && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl bg-night px-3 py-2 text-center text-xs font-bold text-white shadow-lg"
          style={{
            left: `${(active.x / width) * 100}%`,
            top: `${(active.y / height) * 100}%`,
            transform: "translate(-50%, -130%)",
          }}
        >
          <div className="text-sm">Nilai {active.session.score}</div>
          <div className="font-semibold opacity-80">
            {MODE_LABELS[active.session.mode]} {active.session.topic} • ⭐{" "}
            {active.session.stars}
          </div>
          <div className="font-medium opacity-60">
            {new Date(active.session.finishedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })}
          </div>
        </div>
      )}
    </div>
  );
}
