import { and, eq, gte, lt } from "drizzle-orm";
import { sessions, type Session } from "@/db/schema";
import type { DbClient } from "./auth";

/**
 * Laporan mingguan performa anak dari tabel `sessions`.
 * Mencerminkan lib/report.ts (versi client/localStorage) tetapi bersumber
 * dari database.
 */

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const MASTERY_SCORE = 80;
export const NEEDS_PRACTICE_SCORE = 60;

export interface TopicPerformance {
  mathType: string;
  topicNumber: number;
  label: string;
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
  previous: WeeklyStats;
  delta: { sessions: number; stars: number; avgScore: number };
  mastered: TopicPerformance[];
  needsPractice: TopicPerformance[];
  allTopics: TopicPerformance[];
}

function labelFor(mathType: string, topic: number): string {
  const nice = mathType === "perkalian" ? "Perkalian" : "Pembagian";
  return `${nice} ${topic}`;
}

function summarize(rows: Session[]): WeeklyStats {
  const totalQuestions = rows.reduce((s, r) => s + r.totalQuestions, 0);
  return {
    totalSessions: rows.length,
    totalStars: rows.reduce((s, r) => s + r.starsEarned, 0),
    correct: rows.reduce((s, r) => s + r.correctAnswers, 0),
    totalQuestions,
    avgScore:
      rows.length === 0
        ? 0
        : Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length),
  };
}

async function sessionsBetween(
  db: DbClient,
  userId: string,
  from: Date,
  to: Date,
): Promise<Session[]> {
  return db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        gte(sessions.createdAt, from),
        lt(sessions.createdAt, to),
      ),
    );
}

/** Susun laporan 7 hari terakhir untuk seorang anak. */
export async function buildWeeklyReportDb(
  db: DbClient,
  userId: string,
  now: number = Date.now(),
): Promise<WeeklyReport> {
  const nowDate = new Date(now);
  const weekAgo = new Date(now - WEEK_MS);
  const twoWeeksAgo = new Date(now - 2 * WEEK_MS);

  const [currentRows, prevRows] = await Promise.all([
    sessionsBetween(db, userId, weekAgo, nowDate),
    sessionsBetween(db, userId, twoWeeksAgo, weekAgo),
  ]);

  const current = summarize(currentRows);
  const previous = summarize(prevRows);

  const byTopic = new Map<string, Session[]>();
  for (const r of currentRows) {
    const key = `${r.mathType}:${r.topicNumber}`;
    const list = byTopic.get(key) ?? [];
    list.push(r);
    byTopic.set(key, list);
  }

  const allTopics: TopicPerformance[] = [...byTopic.values()]
    .map((list) => {
      const first = list[0];
      return {
        mathType: first.mathType,
        topicNumber: first.topicNumber,
        label: labelFor(first.mathType, first.topicNumber),
        attempts: list.length,
        avgScore: Math.round(
          list.reduce((s, r) => s + r.score, 0) / list.length,
        ),
        bestScore: Math.max(...list.map((r) => r.score)),
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

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
