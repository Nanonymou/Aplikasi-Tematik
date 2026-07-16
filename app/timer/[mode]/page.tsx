import { notFound } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import TimerChallenge from "@/components/TimerChallenge";
import { isMathMode } from "@/lib/questions";

export default async function TimerModePage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  if (!isMathMode(mode)) notFound();

  return (
    <AuthGuard>
      <TimerChallenge mode={mode} />
    </AuthGuard>
  );
}
