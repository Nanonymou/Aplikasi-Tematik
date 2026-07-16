"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PinInput from "@/components/PinInput";
import { isValidPin, loginUser, registerUser } from "@/lib/users";

type Tab = "daftar" | "masuk";
/** Langkah pendaftaran: isi data → buat PIN → ulangi PIN */
type RegisterStep = "data" | "pin" | "pin-ulang";

const inputClass =
  "w-full rounded-2xl border-4 border-night/10 bg-white px-4 py-3 text-lg font-bold text-night placeholder:font-semibold placeholder:text-night/30 focus:border-sky focus:outline-none";

/** Matikan autofill browser agar data anak sebelumnya tidak muncul. */
const noAutofill = { autoComplete: "off" } as const;

export default function AuthFlow() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("daftar");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // --- state daftar ---
  const [step, setStep] = useState<RegisterStep>("data");
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");

  // --- state masuk ---
  const [loginName, setLoginName] = useState("");
  const [loginPin, setLoginPin] = useState("");

  const switchTab = (t: Tab) => {
    setTab(t);
    setError("");
    // Bersihkan semua isian saat berpindah tab agar data
    // anak/percobaan sebelumnya tidak tertinggal di form.
    setStep("data");
    setName("");
    setClassName("");
    setSchoolName("");
    setPin("");
    setPinConfirm("");
    setLoginName("");
    setLoginPin("");
  };

  const submitData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !className.trim() || !schoolName.trim()) {
      setError("Ayo isi semua kolomnya dulu ya! ✏️");
      return;
    }
    setError("");
    setStep("pin");
  };

  const submitPin = () => {
    if (!isValidPin(pin)) {
      setError("PIN harus 4 angka ya!");
      return;
    }
    setError("");
    setStep("pin-ulang");
  };

  const submitRegister = async () => {
    if (pinConfirm !== pin) {
      setError("PIN-nya belum sama. Coba ulangi lagi ya! 🙈");
      setPinConfirm("");
      return;
    }
    setBusy(true);
    const result = await registerUser({ name, className, schoolName, pin });
    setBusy(false);
    if (result.error) {
      setError(result.error);
      setStep("data");
      setPin("");
      setPinConfirm("");
      return;
    }
    router.push("/");
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim() || !isValidPin(loginPin)) {
      setError("Isi nama dan PIN 4 angka dulu ya!");
      return;
    }
    setBusy(true);
    const result = await loginUser(loginName, loginPin);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      setLoginPin("");
      return;
    }
    router.push("/");
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center gap-6 px-6 py-10">
      <Link
        href="/"
        className="self-start rounded-2xl bg-white/70 px-4 py-2 text-sm font-bold text-night/70 shadow-pop-sm"
      >
        ← Beranda
      </Link>

      <div className="animate-float-slow text-6xl" aria-hidden>
        🧒⭐
      </div>
      <h1 className="text-center text-3xl font-extrabold text-sky-deep">
        {tab === "daftar" ? "Ayo Kenalan Dulu!" : "Selamat Datang Kembali!"}
      </h1>

      {/* Tab Daftar / Masuk */}
      <div className="flex w-full rounded-3xl bg-white/70 p-1.5 shadow-pop-sm">
        {(
          [
            ["daftar", "🌟 Anak Baru"],
            ["masuk", "🔑 Sudah Punya PIN"],
          ] as const
        ).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            aria-pressed={tab === t}
            className={`flex-1 rounded-2xl px-3 py-2.5 text-sm font-extrabold transition-colors ${
              tab === t ? "bg-sky-deep text-white" : "text-night/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full rounded-2xl bg-coral/15 px-4 py-3 text-center text-sm font-bold text-coral-deep"
          role="alert"
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        {tab === "daftar" ? (
          <motion.div
            key={`daftar-${step}`}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {step === "data" && (
              <form onSubmit={submitData} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-night/60">
                    Siapa namamu?
                  </span>
                  <input
                    {...noAutofill}
                    className={inputClass}
                    placeholder="contoh: Sinta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={30}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-night/60">
                    Kelas berapa?
                  </span>
                  <input
                    {...noAutofill}
                    className={inputClass}
                    placeholder="contoh: 3B"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    maxLength={20}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-night/60">
                    Sekolahmu di mana?
                  </span>
                  <input
                    {...noAutofill}
                    className={inputClass}
                    placeholder="contoh: SDN 1 Melati"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    maxLength={50}
                  />
                </label>
                <button type="submit" className="btn-pop bg-mint hover:bg-mint-deep">
                  Lanjut ➜
                </button>
              </form>
            )}

            {step === "pin" && (
              <div className="flex flex-col items-center gap-5">
                <p className="text-center text-sm font-semibold text-night/60">
                  Buat PIN rahasia 4 angka.
                  <br />
                  Ini kuncimu untuk masuk lagi nanti — jangan lupa ya! 🗝️
                </p>
                <PinInput
                  label="PIN Rahasiaku"
                  value={pin}
                  onChange={setPin}
                  masked={false}
                  autoFocus
                />
                <div className="flex w-full gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("data")}
                    className="btn-pop flex-1 bg-sky hover:bg-sky-deep"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="button"
                    onClick={submitPin}
                    disabled={!isValidPin(pin)}
                    className="btn-pop flex-1 bg-mint hover:bg-mint-deep disabled:opacity-40"
                  >
                    Lanjut ➜
                  </button>
                </div>
              </div>
            )}

            {step === "pin-ulang" && (
              <div className="flex flex-col items-center gap-5">
                <p className="text-center text-sm font-semibold text-night/60">
                  Ketik sekali lagi PIN-mu biar tidak lupa 😉
                </p>
                <PinInput
                  label="Ulangi PIN"
                  value={pinConfirm}
                  onChange={setPinConfirm}
                  autoFocus
                />
                <div className="flex w-full gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("pin");
                      setPinConfirm("");
                      setError("");
                    }}
                    className="btn-pop flex-1 bg-sky hover:bg-sky-deep"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="button"
                    onClick={submitRegister}
                    disabled={!isValidPin(pinConfirm) || busy}
                    className="btn-pop flex-1 bg-coral hover:bg-coral-deep disabled:opacity-40"
                  >
                    {busy ? "Menyimpan…" : "🎉 Selesai!"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.form
            key="masuk"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={submitLogin}
            className="flex w-full flex-col items-center gap-5"
          >
            <label className="flex w-full flex-col gap-1">
              <span className="text-sm font-bold text-night/60">Namamu</span>
              <input
                {...noAutofill}
                className={inputClass}
                placeholder="contoh: Sinta"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                maxLength={30}
              />
            </label>
            <PinInput label="PIN Rahasiaku" value={loginPin} onChange={setLoginPin} />
            <button
              type="submit"
              disabled={busy}
              className="btn-pop w-full bg-mint hover:bg-mint-deep disabled:opacity-40"
            >
              {busy ? "Membuka…" : "🚪 Masuk"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </main>
  );
}
