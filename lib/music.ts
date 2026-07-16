/**
 * Musik latar ceria berbasis Web Audio API — loop pentatonik lembut,
 * tanpa file audio. Satu pemutar global untuk seluruh aplikasi.
 */

let ctx: AudioContext | null = null;
let timer: number | null = null;
let step = 0;

// Pola nada pentatonik C mayor yang riang tapi tidak mengganggu.
const PATTERN = [
  523.25, 659.25, 783.99, 659.25, // C5 E5 G5 E5
  587.33, 783.99, 880.0, 783.99, // D5 G5 A5 G5
  523.25, 659.25, 880.0, 1046.5, // C5 E5 A5 C6
  783.99, 659.25, 587.33, 523.25, // G5 E5 D5 C5
];
const STEP_MS = 280;

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

function playNote(freq: number) {
  const audio = getContext();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  const now = audio.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

export function isMusicPlaying(): boolean {
  return timer !== null;
}

export function startMusic() {
  if (typeof window === "undefined" || timer !== null) return;
  const audio = getContext();
  if (!audio) return;
  step = 0;
  timer = window.setInterval(() => {
    playNote(PATTERN[step % PATTERN.length]);
    step += 1;
  }, STEP_MS);
}

export function stopMusic() {
  if (typeof window === "undefined" || timer === null) return;
  window.clearInterval(timer);
  timer = null;
}
