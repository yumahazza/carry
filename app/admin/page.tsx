'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import { BookingStatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/ToastProvider';
import {
  type CanonicalBookingStatus,
  formatBookingCode,
  formatDateID,
  formatDateRangeID,
  formatRupiah,
} from '@/lib/format';

interface AdminStats {
  totalCars: number;
  availableCars: number;
  unavailableCars: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

interface AdminBookingItem {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: CanonicalBookingStatus;
  createdAt: string;
  car: {
    id: string;
    name: string;
    brand: string;
  };
}

export default function AdminOperationalHomePage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [actionModal, setActionModal] = useState<{
    booking: AdminBookingItem;
    nextStatus: 'APPROVED' | 'REJECTED';
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [reloadTick, setReloadTick] = useState(0);

  const handleReload = useCallback(() => {
    setLoading(true);
    setError('');
    setReloadTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/stats', { credentials: 'include' }),
          fetch('/api/admin/bookings', { credentials: 'include' }),
        ]);

        if (!statsRes.ok || !bookingsRes.ok) {
          throw new Error('Gagal memuat ringkasan operasional.');
        }

        const [statsData, bookingsData] = await Promise.all([
          statsRes.json(),
          bookingsRes.json(),
        ]);

        if (!cancelled) {
          setStats(statsData);
          if (Array.isArray(bookingsData)) {
            setBookings(bookingsData);
          }
        }
      } catch {
        if (!cancelled) {
          setError('Gagal memuat ringkasan operasional. Pastikan Anda masuk sebagai Admin.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  // Prioritaskan booking PENDING agar keputusan utama admin langsung terlihat di bagian atas
  const prioritizedBookings = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 'PENDING');
    const others = bookings.filter((b) => b.status !== 'PENDING');
    return [...pending, ...others].slice(0, 8);
  }, [bookings]);

  const handleQuickDecision = async () => {
    if (!actionModal) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/bookings/${actionModal.booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: actionModal.nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast({
          title: 'Gagal memperbarui status',
          description: data.error || 'Terjadi kendala saat memproses pesanan.',
          variant: 'danger',
        });
        return;
      }

      showToast({
        title:
          actionModal.nextStatus === 'APPROVED'
            ? 'Pesanan disetujui (Approved).'
            : 'Pesanan ditolak (Rejected).',
        description:
          actionModal.nextStatus === 'APPROVED'
            ? `Unit ${actionModal.booking.car.name} kini dikunci menjadi Rented.`
            : undefined,
        variant: 'success',
      });
      setActionModal(null);
      handleReload();
    } catch {
      showToast({
        title: 'Koneksi gagal',
        description: 'Periksa jaringan Anda lalu coba lagi.',
        variant: 'danger',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div aria-label="Memuat ringkasan operasional" aria-live="polite" className="space-y-6">
        <div className="skeleton h-16 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="skeleton h-80 rounded-2xl lg:col-span-8" />
          <div className="skeleton h-80 rounded-2xl lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        role="alert"
        className="alert-box alert-danger flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="font-semibold">Gagal memuat ringkasan operasional.</p>
          <p className="mt-0.5 text-sm text-secondary">{error}</p>
        </div>
        <button type="button" onClick={handleReload} className="btn-secondary shrink-0">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Operational Header (DSG §19.1) */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-primary sm:text-3xl">
            Ringkasan Operasional
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Status operasional harian per {formatDateID(new Date())}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Link href="/admin/bookings" className="btn-secondary">
            Tinjau Booking
          </Link>
          <Link href="/admin/cars/new" className="btn-primary">
            Tambah Mobil
          </Link>
        </div>
      </div>

      {/* Conditional Actionable Alert Strip (DSG §19.2) */}
      {stats.pendingBookings > 0 && (
        <div
          role="status"
          className="alert-box alert-warning flex-col justify-between sm:flex-row sm:items-center"
        >
          <div>
            <p className="font-semibold">
              Terdapat {stats.pendingBookings} pesanan berstatus Pending yang perlu ditinjau.
            </p>
            <p className="text-sm text-secondary">
              Setujui pesanan yang valid untuk mengunci ketersediaan unit kendaraan.
            </p>
          </div>
          <Link href="/admin/bookings?status=PENDING" className="btn-secondary btn-sm shrink-0">
            Buka Antrean Pending
          </Link>
        </div>
      )}

      {/* Primary Workspace Split: Triage Queue First + Operational Summary (DSG §19.4 + antislop-ui C-3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 8 Cols: Pending Decisions & Recent Bookings (DSG §19.5) */}
        <section className="surface-card rounded-2xl p-5 lg:col-span-8">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-border-subtle pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-primary">
                Antrean Tinjauan &amp; Pesanan Terbaru
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Pesanan berstatus Pending ditempatkan paling atas untuk keputusan cepat.
              </p>
            </div>
            <Link
              href="/admin/bookings"
              className="text-sm font-semibold text-text-brand underline-offset-4 hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {prioritizedBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-control px-5 py-12 text-center">
              <h3 className="font-display text-base font-semibold text-primary">
                Belum ada pesanan terbaru
              </h3>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-secondary">
                Permintaan sewa baru dari pelanggan akan langsung muncul di antrean ini.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {prioritizedBookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex flex-col justify-between gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-primary">
                        {booking.customerName}
                      </p>
                      <BookingStatusBadge status={booking.status} />
                      <span className="font-mono text-xs text-muted">
                        {formatBookingCode(booking.id)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-secondary">
                      {booking.car.brand} {booking.car.name} &bull;{' '}
                      {formatDateRangeID(booking.startDate, booking.endDate)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className="mr-1 tabular-nums text-sm font-bold text-primary">
                      {formatRupiah(booking.totalPrice)}
                    </span>

                    {booking.status === 'PENDING' ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActionModal({ booking, nextStatus: 'APPROVED' })
                          }
                          className="btn-success-soft btn-sm"
                        >
                          Setujui
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActionModal({ booking, nextStatus: 'REJECTED' })
                          }
                          className="btn-danger-soft btn-sm"
                        >
                          Tolak
                        </button>
                      </>
                    ) : (
                      <Link href="/admin/bookings" className="btn-ghost btn-sm">
                        Kelola
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Right 4 Cols: Operational Metrics & Quick Actions (DSG §19.3 & §19.6) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Operational Mini Stats (Real DB metrics only: R-17) */}
          <section aria-label="Ringkasan metrik hari ini" className="grid grid-cols-2 gap-3">
            <div className="surface-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                Pending
              </p>
              <p className="mt-1 tabular-nums font-display text-2xl font-bold text-warning">
                {stats.pendingBookings}
              </p>
              <p className="mt-0.5 text-xs text-secondary">Menunggu tinjauan</p>
            </div>

            <div className="surface-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                Sewa Aktif
              </p>
              <p className="mt-1 tabular-nums font-display text-2xl font-bold text-primary">
                {stats.approvedBookings}
              </p>
              <p className="mt-0.5 text-xs text-secondary">Berstatus Approved</p>
            </div>

            <div className="surface-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                Unit Siap
              </p>
              <p className="mt-1 tabular-nums font-display text-2xl font-bold text-success">
                {stats.availableCars}
                <span className="ml-1 font-sans text-xs font-normal text-muted">
                  / {stats.totalCars}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-secondary">Armada Available</p>
            </div>

            <div className="surface-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                Unit Disewa
              </p>
              <p className="mt-1 tabular-nums font-display text-2xl font-bold text-primary">
                {stats.unavailableCars}
              </p>
              <p className="mt-0.5 text-xs text-secondary">Armada Rented</p>
            </div>
          </section>

          {/* Revenue Summary Card */}
          <div className="surface-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              Estimasi Pendapatan Terkunci
            </p>
            <p className="mt-1.5 tabular-nums font-display text-2xl font-bold text-primary">
              {formatRupiah(stats.totalRevenue)}
            </p>
            <p className="mt-1 text-xs text-secondary">
              Akumulasi pesanan Approved ({stats.approvedBookings}) dan Completed ({stats.completedBookings}).
            </p>
          </div>

          {/* Quick Actions Panel (DSG §19.6) */}
          <section className="surface-card p-5">
            <h2 className="font-display text-base font-semibold text-primary">
              Pintasan Operasional
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { href: '/admin/cars/new', label: 'Tambah Mobil Baru' },
                { href: '/admin/cars', label: 'Kelola Armada Mobil' },
                { href: '/admin/bookings?status=PENDING', label: 'Tinjau Pesanan Pending' },
                { href: '/admin/dashboard', label: 'Lihat Dashboard Analitik' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex min-h-11 items-center justify-between rounded-[10px] border border-border-subtle px-3.5 text-sm font-medium text-primary transition-colors hover:border-border-control hover:bg-surface-raised"
                >
                  <span>{action.label}</span>
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-muted"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Confirmation Modal for Quick Triage */}
      <Modal
        open={Boolean(actionModal)}
        onClose={() => !submitting && setActionModal(null)}
        title={
          actionModal?.nextStatus === 'APPROVED'
            ? 'Setujui permintaan sewa ini?'
            : 'Tolak permintaan sewa ini?'
        }
        danger={actionModal?.nextStatus === 'REJECTED'}
        description={
          actionModal
            ? actionModal.nextStatus === 'APPROVED'
              ? `Menyetujui pesanan ${actionModal.booking.customerName} akan mengubah status mobil ${actionModal.booking.car.name} menjadi Rented sehingga tidak bisa dipesan pelanggan lain.`
              : `Pesanan ${actionModal.booking.customerName} untuk ${actionModal.booking.car.name} akan ditandai Rejected dan mobil tetap berstatus Available.`
            : undefined
        }
        footer={
          <>
            <button
              type="button"
              disabled={submitting}
              onClick={() => setActionModal(null)}
              className="btn-secondary w-full sm:w-auto"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleQuickDecision}
              className={
                actionModal?.nextStatus === 'REJECTED'
                  ? 'btn-danger-solid w-full sm:w-auto'
                  : 'btn-primary w-full sm:w-auto'
              }
            >
              {submitting
                ? 'Memproses...'
                : actionModal?.nextStatus === 'APPROVED'
                  ? 'Ya, Setujui'
                  : 'Ya, Tolak'}
            </button>
          </>
        }
      />
    </div>
  );
}
