/**
 * Penyimpanan profil pengguna di localStorage (stub — diganti backend nanti).
 * PIN tidak pernah disimpan sebagai teks polos: yang disimpan hash SHA-256
 * dari `${nama}:${pin}` (nama dipakai sebagai salt sederhana).
 */

export interface UserProfile {
  id: string;
  name: string;
  className: string;
  schoolName: string;
  /** Emoji avatar; dipilih di fitur profil (default bintang). */
  avatar: string;
  pinHash: string;
  createdAt: string;
}

const USERS_KEY = "bintang-berhitung:users";
const CURRENT_KEY = "bintang-berhitung:current-user";

export const PIN_LENGTH = 4;

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export async function hashPin(name: string, pin: string): Promise<string> {
  const data = new TextEncoder().encode(`${normalizeName(name)}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

/** PIN semua angka sama (0000, 1111, …) terlalu gampang ditebak. */
export function isWeakPin(pin: string): boolean {
  return /^(\d)\1+$/.test(pin);
}

// ---------- Pembatas percobaan PIN (anti tebak-tebakan) ----------

const ATTEMPTS_KEY = "bintang-berhitung:pin-attempts";
export const MAX_PIN_ATTEMPTS = 5;
export const LOCK_SECONDS = 30;

interface AttemptRecord {
  count: number;
  /** Epoch ms; terkunci sampai waktu ini setelah percobaan habis. */
  lockedUntil: number;
}

function loadAttempts(): Record<string, AttemptRecord> {
  try {
    const raw = window.localStorage.getItem(ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAttempts(attempts: Record<string, AttemptRecord>) {
  window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

/** Sisa detik kunci untuk sebuah nama; 0 kalau tidak terkunci. */
export function lockRemainingSeconds(name: string): number {
  const record = loadAttempts()[normalizeName(name)];
  if (!record) return 0;
  return Math.max(0, Math.ceil((record.lockedUntil - Date.now()) / 1000));
}

function recordFailedAttempt(name: string): number {
  const attempts = loadAttempts();
  const key = normalizeName(name);
  const record = attempts[key] ?? { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_PIN_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCK_SECONDS * 1000;
    record.count = 0;
  }
  attempts[key] = record;
  saveAttempts(attempts);
  return record.lockedUntil > Date.now()
    ? 0
    : MAX_PIN_ATTEMPTS - record.count;
}

function clearAttempts(name: string) {
  const attempts = loadAttempts();
  delete attempts[normalizeName(name)];
  saveAttempts(attempts);
}

export function loadUsers(): UserProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as UserProfile[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: UserProfile[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByName(name: string): UserProfile | undefined {
  const target = normalizeName(name);
  return loadUsers().find((u) => normalizeName(u.name) === target);
}

export async function registerUser(input: {
  name: string;
  className: string;
  schoolName: string;
  pin: string;
}): Promise<{ user?: UserProfile; error?: string }> {
  const name = input.name.trim();
  if (!name) return { error: "Nama tidak boleh kosong." };
  if (!input.className.trim()) return { error: "Kelas tidak boleh kosong." };
  if (!input.schoolName.trim())
    return { error: "Nama sekolah tidak boleh kosong." };
  if (!isValidPin(input.pin))
    return { error: `PIN harus ${PIN_LENGTH} angka.` };
  if (isWeakPin(input.pin))
    return {
      error:
        "PIN dengan angka yang sama semua gampang ditebak. Pilih yang lain ya! 🕵️",
    };
  if (findUserByName(name))
    return {
      error: "Nama ini sudah dipakai. Kalau itu kamu, coba Masuk dengan PIN.",
    };

  const user: UserProfile = {
    id: crypto.randomUUID(),
    name,
    className: input.className.trim(),
    schoolName: input.schoolName.trim(),
    avatar: "⭐",
    pinHash: await hashPin(name, input.pin),
    createdAt: new Date().toISOString(),
  };
  saveUsers([...loadUsers(), user]);
  setCurrentUserId(user.id);
  return { user };
}

export async function loginUser(
  name: string,
  pin: string,
): Promise<{ user?: UserProfile; error?: string }> {
  const user = findUserByName(name);
  if (!user)
    return { error: "Nama tidak ditemukan. Coba daftar dulu ya!" };

  const lockSeconds = lockRemainingSeconds(name);
  if (lockSeconds > 0)
    return {
      error: `Terlalu banyak salah PIN. Tunggu ${lockSeconds} detik dulu ya! ⏳`,
    };

  const hash = await hashPin(user.name, pin);
  if (hash !== user.pinHash) {
    const remaining = recordFailedAttempt(name);
    if (remaining === 0)
      return {
        error: `Terlalu banyak salah PIN. Tunggu ${LOCK_SECONDS} detik dulu ya! ⏳`,
      };
    return {
      error: `PIN salah. Sisa ${remaining} kesempatan lagi. Coba ingat-ingat ya! 🤔`,
    };
  }

  clearAttempts(name);
  setCurrentUserId(user.id);
  return { user };
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(CURRENT_KEY);
  if (!id) return null;
  return loadUsers().find((u) => u.id === id) ?? null;
}

export function setCurrentUserId(id: string) {
  window.localStorage.setItem(CURRENT_KEY, id);
}

/** Keluar dari sesi saat ini (Switch User). Data pengguna tetap tersimpan. */
export function logoutUser() {
  window.localStorage.removeItem(CURRENT_KEY);
}
