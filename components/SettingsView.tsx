"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { stopMusic } from "@/lib/music";
import {
  eraseAllData,
  loadSettings,
  saveSettings,
  type AppSettings,
} from "@/lib/settings";

function Toggle({
  checked,
  onChange,
  emoji,
  title,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-3xl bg-white/85 px-5 py-4 text-left shadow-pop-sm"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden>
          {emoji}
        </span>
        <div>
          <div className="font-extrabold text-night">{title}</div>
          <div className="text-xs font-semibold text-night/50">
            {description}
          </div>
        </div>
      </div>
      <span
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
          checked ? "bg-mint" : "bg-night/15"
        }`}
        aria-hidden
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsView() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [confirmErase, setConfirmErase] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  if (!settings) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-2xl font-bold text-sky-deep">
        Membuka pengaturan… ⚙️
      </div>
    );
  }

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-6 py-10">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="rounded-2xl bg-white/70 px-4 py-2 text-sm font-bold text-night/70 shadow-pop-sm"
        >
          ← Beranda
        </Link>
        <h1 className="text-2xl font-extrabold text-sky-deep">⚙️ Pengaturan</h1>
      </div>

      <Link
        href="/laporan"
        className="flex items-center justify-between gap-3 rounded-3xl bg-white/85 px-5 py-4 shadow-pop-sm"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            📈
          </span>
          <div className="text-left">
            <div className="font-extrabold text-night">Laporan Mingguan</div>
            <div className="text-xs font-semibold text-night/50">
              Lihat perkembangan si kecil dalam 7 hari terakhir
            </div>
          </div>
        </div>
        <span className="text-xl text-night/40" aria-hidden>
          →
        </span>
      </Link>

      <section aria-label="Audio" className="flex flex-col gap-3">
        <Toggle
          emoji="🔊"
          title="Suara"
          description="Sorakan dan bunyi seru saat menjawab soal"
          checked={settings.sfx}
          onChange={(sfx) => update({ sfx })}
        />
        <Toggle
          emoji="🎵"
          title="Musik Latar"
          description="Musik ceria yang menemani saat latihan"
          checked={settings.music}
          onChange={(music) => update({ music })}
        />
      </section>

      <section
        aria-label="Data"
        className="mt-2 rounded-3xl border-4 border-coral/30 bg-white/85 p-5"
      >
        <h2 className="font-extrabold text-coral-deep">🗑️ Hapus Data</h2>
        <p className="mt-1 text-xs font-semibold text-night/50">
          Menghapus SEMUA akun anak, riwayat nilai, bintang, dan level di
          perangkat ini. Tidak bisa dibatalkan!
        </p>
        <button
          type="button"
          onClick={() => setConfirmErase(true)}
          className="btn-pop mt-3 w-full bg-coral hover:bg-coral-deep"
        >
          Hapus Semua Data
        </button>
      </section>

      <ConfirmDialog
        open={confirmErase}
        emoji="🗑️"
        title="Hapus semua data?"
        message="Semua akun, bintang, nilai, dan level di perangkat ini akan hilang selamanya. Yakin?"
        confirmLabel="Ya, Hapus Semua"
        cancelLabel="Batal"
        onConfirm={() => {
          eraseAllData();
          // eraseAllData tidak memicu event settings, jadi hentikan
          // musik secara eksplisit (preferensi kembali ke default: mati).
          stopMusic();
          setConfirmErase(false);
          router.replace("/masuk");
        }}
        onCancel={() => setConfirmErase(false)}
      />
    </main>
  );
}
