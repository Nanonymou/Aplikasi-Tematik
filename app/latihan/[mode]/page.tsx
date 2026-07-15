import Link from "next/link";
import { notFound } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import TopicGrid from "@/components/TopicGrid";
import { isMathMode, MODE_LABELS } from "@/lib/questions";

export default async function TopicPickerPage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  if (!isMathMode(mode)) notFound();

  const label = MODE_LABELS[mode];

  return (
    <AuthGuard>
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

      <TopicGrid mode={mode} />
    </main>
    </AuthGuard>
  );
}
