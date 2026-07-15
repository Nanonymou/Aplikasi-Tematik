import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <div className="animate-float-slow text-7xl" aria-hidden>
        ⭐
      </div>
      <h1 className="text-4xl font-extrabold text-sky-deep drop-shadow-sm sm:text-5xl">
        Bintang Berhitung
      </h1>
      <p className="max-w-md text-lg font-semibold text-night/70">
        Ayo latihan perkalian dan pembagian angka 1 sampai 10! Jawab soal,
        kumpulkan bintang, dan jadilah juara berhitung! 🎉
      </p>

      <div className="grid w-full gap-5 sm:grid-cols-2">
        <Link
          href="/latihan/perkalian"
          className="btn-pop flex-col gap-1 bg-coral py-8 hover:bg-coral-deep"
        >
          <span className="text-5xl" aria-hidden>
            ✖️
          </span>
          <span className="text-2xl">Perkalian</span>
          <span className="text-sm font-semibold opacity-90">
            1 × 1 sampai 10 × 10
          </span>
        </Link>
        <Link
          href="/latihan/pembagian"
          className="btn-pop flex-col gap-1 bg-grape py-8 hover:bg-grape-deep"
        >
          <span className="text-5xl" aria-hidden>
            ➗
          </span>
          <span className="text-2xl">Pembagian</span>
          <span className="text-sm font-semibold opacity-90">
            hasil 1 sampai 10
          </span>
        </Link>
      </div>
    </main>
  );
}
