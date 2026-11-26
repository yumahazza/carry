export type CanonicalBookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

/** Format angka Rupiah sesuai DSG §14.1: "Rp 450.000" */
export function formatRupiah(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `Rp ${safe.toLocaleString('id-ID')}`;
}

const MONTHS_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * Format tanggal deterministik dalam Bahasa Indonesia sesuai DSG §14.2 ("12 Okt 2026")
 * tanpa bergantung pada locale OS server agar bebas hydration mismatch.
 */
export function formatDateID(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '-';
  const day = d.getDate();
  const month = MONTHS_SHORT_ID[d.getMonth()] ?? '';
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format rentang tanggal sesuai R-02 & keputusan R-37:
 * menggunakan penghubung alami "hingga" tanpa karakter em dash.
 */
export function formatDateRangeID(start: string | Date, end: string | Date): string {
  return `${formatDateID(start)} hingga ${formatDateID(end)}`;
}

/** Hitung jumlah hari sewa (minimal 1 hari jika tanggal selesai > tanggal mulai) */
export function countRentalDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  if (Number.isNaN(diffMs) || diffMs <= 0) return 0;
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/** Format input YYYY-MM-DD lokal untuk atribut min pada <input type="date"> */
export function getTodayInputDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Format kode referensi singkat booking untuk tampilan monospace */
export function formatBookingCode(id: string): string {
  if (!id) return '#------';
  return `#${id.slice(-6).toUpperCase()}`;
}
