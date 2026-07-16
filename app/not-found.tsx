import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div className="animate-float-slow text-7xl" aria-hidden>
        🧭
      </div>
      <h1 className="text-3xl font-extrabold text-sky-deep">Wah, Tersesat!</h1>
      <p className="font-semibold text-night/60">
        Halaman yang kamu cari tidak ada. Yuk kembali ke beranda dan lanjut
        belajar!
      </p>
      <Link href="/" className="btn-pop bg-coral hover:bg-coral-deep">
        🏠 Kembali ke Beranda
      </Link>
    </main>
  );
}
