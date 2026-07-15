import Link from "next/link";
import { notFound } from "next/navigation";
import { isMathMode, MODE_LABELS } from "@/lib/questions";

const TOPIC_COLORS = [
  "bg-coral hover:bg-coral-deep",
  "bg-sky hover:bg-sky-deep",
  "bg-mint hover:bg-mint-deep",
  "bg-grape hover:bg-grape-deep",
  "bg-sunshine hover:bg-sunshine-dark",
];

export default async function TopicPickerPage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  if (!isMathMode(mode)) notFound();

  const label = MODE_LABELS[mode];
  const symbol = mode === "perkalian" ? "×" : "÷";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center gap-8 px-6 py-10">
      <Link
        href="/"
        className="self-start rounded-2xl bg-white/70 px-4 py-2 text-sm font-bold text-night/70 shadow-pop-sm"
      >
        ← Beranda
      </Link>

      <div className="text-center">
        <div className="animate-wiggle text-6xl" aria-hidden>
          {mode === "perkalian" ? "✖️" : "➗"}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-sky-deep sm:text-4xl">
          Pilih Topik {label}
        </h1>
        <p className="mt-2 font-semibold text-night/60">
          Mau latihan {label.toLowerCase()} angka berapa hari ini?
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((topic) => (
          <Link
            key={topic}
            href={`/latihan/${mode}/${topic}`}
            className={`btn-pop flex-col py-5 ${TOPIC_COLORS[(topic - 1) % TOPIC_COLORS.length]}`}
          >
            <span className="text-3xl font-extrabold">
              {symbol} {topic}
            </span>
            <span className="text-xs font-semibold opacity-90">
              {label} {topic}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
