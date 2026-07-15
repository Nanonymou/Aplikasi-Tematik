import { NextResponse } from "next/server";
import { verifyChallenge } from "@/lib/server/challenge";

export const dynamic = "force-dynamic";

/**
 * POST /api/challenge/verify
 * Body: { nonce, signature, answer }
 * → { ok: boolean }. Verifikasi stateless memakai tanda tangan HMAC dari
 *   endpoint GET /api/challenge; jawaban benar tak pernah disimpan di server.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Body bukan JSON yang valid." },
      { status: 400 },
    );
  }

  const { nonce, signature, answer } = (body ?? {}) as {
    nonce?: unknown;
    signature?: unknown;
    answer?: unknown;
  };

  if (typeof nonce !== "string" || typeof signature !== "string") {
    return NextResponse.json(
      { ok: false, error: "nonce dan signature wajib berupa string." },
      { status: 400 },
    );
  }

  const answerNum =
    typeof answer === "number" ? answer : Number(answer);
  if (!Number.isInteger(answerNum)) {
    return NextResponse.json(
      { ok: false, error: "answer wajib berupa angka." },
      { status: 400 },
    );
  }

  const ok = await verifyChallenge(nonce, signature, answerNum);
  return NextResponse.json({ ok }, { headers: { "Cache-Control": "no-store" } });
}
