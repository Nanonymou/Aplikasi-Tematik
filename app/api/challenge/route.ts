import { NextResponse } from "next/server";
import { createChallenge } from "@/lib/server/challenge";

// Soal harus selalu baru — jangan di-cache.
export const dynamic = "force-dynamic";

/** GET /api/challenge → soal Parental Gate acak (tanpa membocorkan jawaban). */
export async function GET() {
  const challenge = await createChallenge();
  return NextResponse.json(challenge, {
    headers: { "Cache-Control": "no-store" },
  });
}
