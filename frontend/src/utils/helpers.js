/**
 * Formats date into readable Indonesian string (e.g. "Senin, 24 Agustus 2026")
 */
export function formatIndoDate(dateString, options = {}) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const defaultOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };
  return new Intl.DateTimeFormat("id-ID", defaultOptions).format(date);
}

/**
 * Returns YYYY-MM-DD string
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Auto-detects whether today is Friday (Murojaah Pekanan) or Monday-Thursday (Murojaah Harian)
 * Friday is day index 5 in JS (0=Sunday, 5=Friday)
 */
export function getAutoMurojaahType(dateString = null) {
  const d = dateString ? new Date(dateString) : new Date();
  const day = d.getDay();
  if (day === 5) {
    return {
      type: "WEEKLY_MUROJAAH",
      label: "Murojaah Pekanan",
      isFriday: true,
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      description: "Hari Jumat: Rekap dan evaluasi hafalan sepekan",
    };
  }
  return {
    type: "DAILY_MUROJAAH",
    label: "Murojaah Harian",
    isFriday: false,
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    description: "Senin - Kamis: Murojaah hafalan harian",
  };
}

/**
 * Score definitions & visual badges (A, B, C)
 */
export const SCORE_MAP = {
  A: {
    code: "A",
    label: "Sangat Baik (Mutqin)",
    description: "Lancar, tajwid & makhraj sangat baik, kesalahan sangat minim.",
    bg: "bg-emerald-500",
    lightBg: "bg-emerald-50 border-emerald-200 text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    textColor: "text-emerald-600",
    starCount: 5,
  },
  B: {
    code: "B",
    label: "Baik",
    description: "Cukup lancar, ada beberapa kesalahan mad/ghunnah, perlu sedikit bimbingan.",
    bg: "bg-amber-500",
    lightBg: "bg-amber-50 border-amber-200 text-amber-700",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    textColor: "text-amber-600",
    starCount: 4,
  },
  C: {
    code: "C",
    label: "Perlu Perbaikan",
    description: "Belum lancar, banyak kesalahan, perlu pengulangan murojaah mandiri.",
    bg: "bg-rose-500",
    lightBg: "bg-rose-50 border-rose-200 text-rose-700",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    textColor: "text-rose-600",
    starCount: 2,
  },
};

/**
 * Quick Note Presets for Teachers
 */
export const QUICK_NOTE_PRESETS = [
  "Hafalan sangat lancar, tajwid dan makharijul huruf mantap.",
  "Bacaan tartil dan tartib, pertahankan konsistensinya.",
  "Cukup lancar, perhatikan panjang pendek bacaan (Mad).",
  "Perlu perbaikan pada hukum Ghunnah dan Ikhfa.",
  "Makhraj huruf 'Ain, Ha, dan Shad perlu diperjelas.",
  "Belum lancar, mohon diulang murojaah di rumah bersama orang tua.",
];

/**
 * Report type definitions
 */
export const REPORT_TYPE_MAP = {
  NEW_MEMORIZATION: {
    label: "Hafalan Baru",
    shortLabel: "Hafalan",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  DAILY_MUROJAAH: {
    label: "Murojaah Harian",
    shortLabel: "Murojaah",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
  },
  WEEKLY_MUROJAAH: {
    label: "Murojaah Mingguan",
    shortLabel: "Mingguan",
    badge: "bg-purple-100 text-purple-800 border-purple-200",
  },
};

/**
 * Attendance status map
 */
export const ATTENDANCE_STATUS_MAP = {
  hadir: { label: "Hadir", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  izin: { label: "Izin", badge: "bg-amber-100 text-amber-800 border-amber-200" },
  sakit: { label: "Sakit", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  alpa: { label: "Alpa", badge: "bg-rose-100 text-rose-800 border-rose-200" },
};

/**
 * Formats API image URLs
 */
export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || "https://api.kingcreativestudio.my.id/tahfidz-nur/api").replace("/api", "");
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}
