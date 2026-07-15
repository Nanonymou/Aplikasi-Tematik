/**
 * Efek suara ringan berbasis Web Audio API — tanpa file audio eksternal.
 * Aman dipanggil berkali-kali; AudioContext dibuat sekali saat interaksi pertama.
 */

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

interface Tone {
  freq: number;
  /** Detik sejak mulai */
  at: number;
  /** Durasi nada dalam detik */
  dur: number;
  type?: OscillatorType;
  gain?: number;
}

function playTones(tones: Tone[]) {
  const audio = getContext();
  if (!audio) return;
  const now = audio.currentTime;

  for (const tone of tones) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = tone.type ?? "triangle";
    osc.frequency.setValueAtTime(tone.freq, now + tone.at);

    const peak = tone.gain ?? 0.18;
    gain.gain.setValueAtTime(0.0001, now + tone.at);
    gain.gain.exponentialRampToValueAtTime(peak, now + tone.at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.at + tone.dur);

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now + tone.at);
    osc.stop(now + tone.at + tone.dur + 0.05);
  }
}

/** Sorakan ceria saat jawaban benar (arpeggio naik + nada kemenangan). */
export function playCheer() {
  playTones([
    { freq: 523.25, at: 0, dur: 0.12 }, // C5
    { freq: 659.25, at: 0.1, dur: 0.12 }, // E5
    { freq: 783.99, at: 0.2, dur: 0.12 }, // G5
    { freq: 1046.5, at: 0.3, dur: 0.3, gain: 0.22 }, // C6
  ]);
}

/** Suara lucu "womp womp" saat jawaban salah — jenaka, tidak menakutkan. */
export function playWomp() {
  playTones([
    { freq: 220, at: 0, dur: 0.18, type: "sawtooth", gain: 0.12 },
    { freq: 174.61, at: 0.2, dur: 0.32, type: "sawtooth", gain: 0.12 },
  ]);
}

/** Bunyi klik kecil untuk tombol angka. */
export function playClick() {
  playTones([{ freq: 880, at: 0, dur: 0.05, type: "square", gain: 0.05 }]);
}

/** Fanfare singkat saat sesi selesai. */
export function playFanfare() {
  playTones([
    { freq: 523.25, at: 0, dur: 0.15 },
    { freq: 659.25, at: 0.15, dur: 0.15 },
    { freq: 783.99, at: 0.3, dur: 0.15 },
    { freq: 1046.5, at: 0.45, dur: 0.2, gain: 0.22 },
    { freq: 783.99, at: 0.65, dur: 0.12 },
    { freq: 1046.5, at: 0.8, dur: 0.45, gain: 0.24 },
  ]);
}
