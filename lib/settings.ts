/**
 * Preferensi pengguna (per perangkat, localStorage):
 * efek suara & musik latar. Perubahan disiarkan lewat custom event
 * supaya komponen lain (mis. pemutar musik) langsung bereaksi.
 */

export interface AppSettings {
  /** Efek suara latihan (sorak, womp, klik). */
  sfx: boolean;
  /** Musik latar ceria. */
  music: boolean;
}

const SETTINGS_KEY = "bintang-berhitung:settings";
export const SETTINGS_EVENT = "bb:settings-changed";

const DEFAULTS: AppSettings = { sfx: true, music: false };

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: settings }));
  } catch {
    // Penyimpanan penuh/diblokir — preferensi hanya berlaku sesi ini.
  }
}

export function isSfxEnabled(): boolean {
  return loadSettings().sfx;
}

export function isMusicEnabled(): boolean {
  return loadSettings().music;
}

// ---------- Hapus Data ----------

/**
 * Hapus semua data aplikasi dan mulai dari awal (PRD: Hapus Data).
 * Menyapu SEMUA kunci berprefix aplikasi agar kunci baru di masa depan
 * tidak pernah tertinggal dari daftar manual.
 */
export function eraseAllData() {
  if (typeof window === "undefined") return;
  const PREFIX = "bintang-berhitung:";
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of Object.keys(storage)) {
      if (key.startsWith(PREFIX)) storage.removeItem(key);
    }
  }
}
