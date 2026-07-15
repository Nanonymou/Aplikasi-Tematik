import { notFound } from "next/navigation";
import ExerciseSession from "@/components/ExerciseSession";
import { isMathMode, isValidTopic } from "@/lib/questions";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ mode: string; topic: string }>;
}) {
  const { mode, topic } = await params;
  const topicNumber = Number(topic);

  if (!isMathMode(mode) || !isValidTopic(topicNumber)) notFound();

  return <ExerciseSession mode={mode} topic={topicNumber} />;
}
