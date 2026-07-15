import type { MathMode } from "./questions";
import { getCurrentUser } from "./users";

/**
 * Sistem level (stub localStorage, mencerminkan tabel `unlocked_levels`
 * pada PRD): per anak & per mode, topik 1 terbuka sejak awal; topik
 * berikutnya terbuka setelah meraih nilai >= UNLOCK_SCORE di topik
 * tertinggi yang sudah terbuka. Topik yang terbuka bisa diulang kapan
 * saja untuk memperbaiki skor.
 */

export const UNLOCK_SCORE = 70;
export const MAX_TOPIC = 10;

const LEVELS_KEY = "bintang-berhitung:levels";

type LevelMap = Record<string, number>; // `${userId}:${mode}` -> topik tertinggi terbuka

function loadLevels(): LevelMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LEVELS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function levelKey(mode: MathMode): string | null {
  const user = getCurrentUser();
  return user ? `${user.id}:${mode}` : null;
}

/** Topik tertinggi yang sudah terbuka untuk anak aktif (min 1). */
export function getMaxUnlockedTopic(mode: MathMode): number {
  const key = levelKey(mode);
  if (!key) return 1;
  const value = loadLevels()[key];
  return Number.isInteger(value) && value! >= 1
    ? Math.min(value!, MAX_TOPIC)
    : 1;
}

export function isTopicUnlocked(mode: MathMode, topic: number): boolean {
  return topic <= getMaxUnlockedTopic(mode);
}

/**
 * Panggil setelah sesi selesai. Kalau nilai cukup dan topik yang dimainkan
 * adalah level tertinggi, buka level berikutnya.
 * @returns nomor topik yang baru terbuka, atau null.
 */
export function maybeUnlockNextTopic(
  mode: MathMode,
  playedTopic: number,
  score: number,
): number | null {
  const key = levelKey(mode);
  if (!key) return null;
  const current = getMaxUnlockedTopic(mode);
  if (score < UNLOCK_SCORE) return null;
  if (playedTopic !== current || current >= MAX_TOPIC) return null;

  const next = current + 1;
  try {
    const levels = loadLevels();
    levels[key] = next;
    window.localStorage.setItem(LEVELS_KEY, JSON.stringify(levels));
  } catch {
    return null;
  }
  return next;
}
