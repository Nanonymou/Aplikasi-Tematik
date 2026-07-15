import { loadSessionResults, type SessionResult } from "./storage";
import { MODE_LABELS, type MathMode } from "./questions";

/**
 * Laporan mingguan untuk orang tua: rangkum performa 7 hari terakhir,
 * menonjolkan topik yang dikuasai dan yang butuh latihan tambahan.
 * Sumber data = sesi latihan anak yang sedang masuk.
 */

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
/** Rata-rata nilai >= ini dianggap "dikuasai". */
export const MASTERY_SCORE = 80;
/** Rata-rata nilai < ini dianggap "butuh latihan". */
export const NEEDS_PRACTICE_SCORE = 60;

export interface TopicPerformance {
  mode: MathMode;
  topic: number;
  label: string; // mis. "Perkalian 3"
  attempts: number;
  avgScore: number;
  bestScore: number;
}

export interface WeeklyStats {
  totalSessions: number;
  totalStars: number;
  avgScore: number;
  correct: number;
  totalQuestions: number;
}

export interface WeeklyReport extends WeeklyStats {
  /** Statistik minggu sebelumnya (7–14 hari lalu) untuk perbandingan. */
  previous: WeeklyStats;
  /** Selisih vs minggu lalu: sesi, bintang, rata-rata nilai. */
  delta: { sessions: number; stars: number; avgScore: number };
  mastered: TopicPerformance[];
  needsPractice: TopicPerformance[];
  /** Semua topik yang dilatih minggu ini, terurut nilai menurun. */
  allTopics: TopicPerformance[];
}

function summarize(sessions: SessionResult[]): WeeklyStats {
  const totalQuestions = sessions.reduce((sum, s) => sum + s.total, 0);
  return {
    totalSessions: sessions.length,
    totalStars: sessions.reduce((sum, s) => sum + s.stars, 0),
    correct: sessions.reduce((sum, s) => sum + s.correct, 0),
    totalQuestions,
    avgScore:
      sessions.length === 0
        ? 0
        : Math.round(
            sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length,
          ),
  };
}

function topicKey(s: SessionResult): string {
  return `${s.mode}:${s.topic}`;
}

/** Susun laporan 7 hari terakhir dari sesi anak yang sedang masuk. */
export function buildWeeklyReport(now: number = Date.now()): WeeklyReport {
  const since = now - WEEK_MS;
  const all = loadSessionResults();
  const sessions = all.filter(
    (s) => new Date(s.finishedAt).getTime() >= since,
  );
  // Minggu sebelumnya: 7–14 hari lalu.
  const prevSessions = all.filter((s) => {
    const t = new Date(s.finishedAt).getTime();
    return t >= now - 2 * WEEK_MS && t < since;
  });
  const current = summarize(sessions);
  const previous = summarize(prevSessions);

  const byTopic = new Map<string, SessionResult[]>();
  for (const s of sessions) {
    const key = topicKey(s);
    const list = byTopic.get(key) ?? [];
    list.push(s);
    byTopic.set(key, list);
  }

  const allTopics: TopicPerformance[] = [...byTopic.values()].map((list) => {
    const first = list[0];
    const avgScore = Math.round(
      list.reduce((sum, s) => sum + s.score, 0) / list.length,
    );
    return {
      mode: first.mode,
      topic: first.topic,
      label: `${MODE_LABELS[first.mode]} ${first.topic}`,
      attempts: list.length,
      avgScore,
      bestScore: Math.max(...list.map((s) => s.score)),
    };
  });
  allTopics.sort((a, b) => b.avgScore - a.avgScore);

  return {
    ...current,
    previous,
    delta: {
      sessions: current.totalSessions - previous.totalSessions,
      stars: current.totalStars - previous.totalStars,
      avgScore: current.avgScore - previous.avgScore,
    },
    mastered: allTopics.filter((t) => t.avgScore >= MASTERY_SCORE),
    needsPractice: allTopics.filter((t) => t.avgScore < NEEDS_PRACTICE_SCORE),
    allTopics,
  };
}
