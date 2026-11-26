'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

interface CustomerBooking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: CanonicalBookingStatus;
  createdAt: string;
  car: {
    id: string;
    name: string;
    brand: string;
    pricePerDay: number;
    image?: string | null;
  };
}

type BookingTab = 'active' | 'history' | 'all';

function BookingTimeline({ status }: { status: CanonicalBookingStatus }) {
  if (status === 'CANCELLED' || status === 'REJECTED') {
    return (
      <div className="mt-4 flex items-center gap-2 text-xs text-danger">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-danger" />
        <span>
          {status === 'CANCELLED'
            ? 'Pesanan ini telah dibatalkan.'
            : 'Permintaan booking ini tidak disetujui oleh admin.'}
        </span>
      </div>
    );
  }

  const steps: { key: CanonicalBookingStatus; label: string }[] = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const currentIdx = steps.findIndex((s) => s.key === status);

  return (
    <div aria-label="Tahapan status pesanan" className="mt-4">
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentIdx || status === 'COMPLETED';
          const isCurrent = idx === currentIdx && status !== 'COMPLETED';
          return (
            <div key={step.key} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${
                  isDone
                    ? 'bg-success'
                    : isCurrent
                      ? 'bg-brand'
                      : 'bg-border-control'
                }`}
              />
              <span
                className={`text-xs ${
                  isCurrent || isDone ? 'font-semibold text-primary' : 'text-muted'
                }`}
              >
                {step.label}
              </span>
              {idx < steps.length - 1 && (
                <span aria-hidden="true" className="h-0.5 w-5 bg-border-subtle sm:w-8" />
              )}
            </div>
          );
        })}
      </div>
      {status === 'COMPLETED' && (
        <p className="mt-1.5 text-xs text-muted">
          Perjalanan selesai dan unit kendaraan telah tersedia kembali.
        </p>
      )}
    </div>
  );
}

function BookingThumbnail({
  image,
  alt,
}: {
  image?: string | null;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return (
      <div className="flex aspect-[16/10] w-full shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-raised text-muted sm:h-[88px] sm:w-[128px] sm:aspect-auto">
        <svg
          aria-hidden="true"
          className="h-8 w-8 stroke-current"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.6"
        >
          <path d="M5 17h14v-4l-2.2-5.5A1.5 1.5 0 0 0 15.4 6.5H8.6a1.5 1.5 0 0 0-1.4.95L5 13v4z" />
          <circle cx="7.5" cy="17.5" r="1.75" />
          <circle cx="16.5" cy="17.5" r="1.75" />
        </svg>
      </div>
    );
  }

  return (
    <div className="aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-surface-raised sm:h-[88px] sm:w-[128px] sm:aspect-auto">
      <img
        src={image}
        alt={alt}
        width={256}
        height={176}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function MyBookingsContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const showSuccessBanner = searchParams.get('success') === 'true' && !bannerDismissed;

  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<BookingTab>('active');
  const [reloadTick, setReloadTick] = useState(0);

  const [cancelTarget, setCancelTarget] = useState<CustomerBooking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [detailTarget, setDetailTarget] = useState<CustomerBooking | null>(null);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleReload = useCallback(() => {
    setLoading(true);
    setError('');
    setReloadTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/my-bookings', { credentials: 'include' });
        if (!res.ok) {
          throw new Error('Gagal memuat daftar pesanan.');
        }
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setBookings(data);
        }
      } catch {
        if (!cancelled) {
          setError('Gagal memuat daftar pesanan. Silakan coba lagi.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const counts = useMemo(() => {
    const active = bookings.filter(
      (b) => b.status === 'PENDING' || b.status === 'APPROVED'
    ).length;
    const history = bookings.length - active;
    return { active, history, all: bookings.length };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'active') {
      return bookings.filter((b) => b.status === 'PENDING' || b.status === 'APPROVED');
    }
    if (activeTab === 'history') {
      return bookings.filter(
        (b) =>
          b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'REJECTED'
      );
    }
    return bookings;
  }, [bookings, activeTab]);

  const confirmCancelBooking = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${cancelTarget.id}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        showToast({
          title: 'Pembatalan gagal',
          description: data.error || 'Pesanan tidak dapat dibatalkan saat ini.',
          variant: 'danger',
        });
        return;
      }

      setBookings((prev) =>
        prev.map((item) =>
          item.id === cancelTarget.id ? { ...item, status: 'CANCELLED' } : item
        )
      );
      showToast({
        title: 'Pesanan berhasil dibatalkan.',
        description:
          cancelTarget.status === 'APPROVED'
            ? 'Status kendaraan telah dikembalikan menjadi Available.'
            : undefined,
        variant: 'success',
      });
      setCancelTarget(null);
    } catch {
      showToast({
        title: 'Gagal terhubung ke server',
        description: 'Periksa koneksi Anda lalu ulangi pembatalan.',
        variant: 'danger',
      });
    } finally {
      setCancelling(false);
    }
  };

  const tabs: { id: BookingTab; label: string; count: number }[] = [
    { id: 'active', label: 'Aktif', count: counts.active },
    { id: 'history', label: 'Riwayat', count: counts.history },
    { id: 'all', label: 'Semua', count: counts.all },
  ];

  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const nextIdx = (idx + dir + tabs.length) % tabs.length;
    setActiveTab(tabs[nextIdx].id);
    tabRefs.current[nextIdx]?.focus();
  };

  return (
    <div className="page-container py-8 sm:py-12">
      {/* Header (DSG §21.1) */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-primary sm:text-4xl">
          Pesanan Saya
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-secondary">
          Pantau status penyewaan aktif dan riwayat perjalanan Anda.
        </p>
      </div>

      {/* Dismissible Success Banner (DSG §21.7) */}
      {showSuccessBanner && (
        <div
          role="status"
          aria-live="polite"
          className="alert-box alert-success mb-6 items-center justify-between"
        >
          <div className="flex items-start gap-3">
            <svg
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold">Pesanan berhasil dikirim.</p>
              <p className="text-sm text-secondary">
                Admin akan segera meninjau permintaan sewa kendaraan Anda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Tutup pemberitahuan"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-secondary hover:bg-surface-overlay hover:text-primary"
          >
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}

      {/* ARIA Tabs / Segmented Control (DSG §21.2 & A11Y-PATTERNS.md) */}
      <div
        role="tablist"
        aria-label="Kategori pesanan"
        className="mb-6 inline-flex w-full items-center gap-1 rounded-[10px] border border-border-control bg-surface p-1 sm:w-auto"
      >
        {tabs.map((tab, idx) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={`min-h-9 flex-1 rounded-lg px-3.5 text-[13px] transition-colors sm:flex-none ${
                selected
                  ? 'bg-brand-soft font-semibold text-text-brand'
                  : 'font-medium text-secondary hover:text-primary'
              }`}
            >
              {tab.label}{' '}
              <span className="ml-1 tabular-nums text-xs opacity-80">({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panel Content */}
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {loading ? (
          <div aria-label="Memuat daftar pesanan" aria-live="polite" className="space-y-4">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div className="skeleton aspect-[16/10] w-full rounded-xl sm:h-[88px] sm:w-[128px] sm:aspect-auto" />
                <div className="flex-1 space-y-2.5">
                  <div className="skeleton h-5 w-1/2" />
                  <div className="skeleton h-4 w-2/5" />
                  <div className="skeleton h-3.5 w-1/3" />
                </div>
                <div className="skeleton h-10 w-full sm:w-36" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="alert-box alert-danger flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">Gagal memuat daftar pesanan.</p>
              <p className="mt-0.5 text-sm text-secondary">{error}</p>
            </div>
            <button type="button" onClick={handleReload} className="btn-secondary shrink-0">
              Coba Lagi
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-control bg-surface px-6 py-14 text-center sm:py-16">
            <h2 className="font-display text-lg font-semibold text-primary">
              {activeTab === 'active'
                ? 'Belum ada pesanan aktif'
                : activeTab === 'history'
                  ? 'Belum ada riwayat perjalanan'
                  : 'Belum ada pesanan tercatat'}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-secondary">
              {activeTab === 'history'
                ? 'Pesanan yang telah selesai, dibatalkan, atau ditolak akan tersimpan di tab ini.'
                : 'Jelajahi armada yang siap jalan untuk menjadwalkan perjalanan pertama Anda.'}
            </p>
            {activeTab !== 'history' ? (
              <Link href="/cars" className="btn-primary mt-5">
                Jelajahi Armada
              </Link>
            ) : (
              counts.active > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('active')}
                  className="btn-secondary mt-5"
                >
                  Lihat Pesanan Aktif ({counts.active})
                </button>
              )
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const canCancel =
                booking.status === 'PENDING' || booking.status === 'APPROVED';

              return (
                <article
                  key={booking.id}
                  className="surface-card rounded-2xl p-5 transition-colors hover:border-border-default"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                      <BookingThumbnail
                        image={booking.car.image}
                        alt={`${booking.car.brand} ${booking.car.name}`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h2 className="truncate font-display text-lg font-semibold text-primary">
                            {booking.car.name}
                          </h2>
                          <BookingStatusBadge status={booking.status} />
                          <span className="font-mono text-xs text-muted">
                            {formatBookingCode(booking.id)}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-secondary">{booking.car.brand}</p>

                        <p className="mt-2 text-sm font-medium text-primary">
                          {formatDateRangeID(booking.startDate, booking.endDate)}
                        </p>

                        <BookingTimeline status={booking.status} />
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-4 border-t border-border-subtle pt-4 lg:items-end lg:border-t-0 lg:pt-0">
                      <div className="lg:text-right">
                        <p className="text-xs text-muted">Total Biaya Sewa</p>
                        <p className="tabular-nums font-display text-xl font-bold text-primary">
                          {formatRupiah(booking.totalPrice)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailTarget(booking)}
                          className="btn-ghost btn-sm"
                        >
                          Detail
                        </button>
                        <Link
                          href={`/cars/${booking.car.id}`}
                          className="btn-secondary btn-sm"
                        >
                          Lihat Mobil
                        </Link>
                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(booking)}
                            className="btn-danger-soft btn-sm"
                          >
                            Batalkan Pesanan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal (DSG §21.6) */}
      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => !cancelling && setCancelTarget(null)}
        title="Batalkan pesanan ini?"
        danger
        description={
          cancelTarget
            ? cancelTarget.status === 'APPROVED'
              ? `Pesanan untuk ${cancelTarget.car.name} sudah berstatus Approved. Membatalkan pesanan ini akan mengembalikan status mobil menjadi Available agar dapat disewa pelanggan lain.`
              : `Permintaan sewa ${cancelTarget.car.name} akan dibatalkan dan tidak lagi ditinjau oleh admin.`
            : undefined
        }
        footer={
          <>
            <button
              type="button"
              disabled={cancelling}
              onClick={() => setCancelTarget(null)}
              className="btn-secondary w-full sm:w-auto"
            >
              Pertahankan Pesanan
            </button>
            <button
              type="button"
              disabled={cancelling}
              onClick={confirmCancelBooking}
              className="btn-danger-solid w-full sm:w-auto"
            >
              {cancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
            </button>
          </>
        }
      />

      {/* Booking Detail Modal */}
      <Modal
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title="Rincian Pesanan"
        size="md"
        footer={
          <button
            type="button"
            onClick={() => setDetailTarget(null)}
            className="btn-secondary w-full sm:w-auto"
          >
            Tutup
          </button>
        }
      >
        {detailTarget && (
          <dl className="divide-y divide-border-subtle text-sm">
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Kode Referensi</dt>
              <dd className="font-mono font-semibold text-primary">
                {formatBookingCode(detailTarget.id)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Status</dt>
              <dd>
                <BookingStatusBadge status={detailTarget.status} />
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Kendaraan</dt>
              <dd className="font-semibold text-primary">
                {detailTarget.car.brand} {detailTarget.car.name}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Periode Sewa</dt>
              <dd className="font-medium text-primary">
                {formatDateRangeID(detailTarget.startDate, detailTarget.endDate)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Nama Penyewa</dt>
              <dd className="text-primary">{detailTarget.customerName}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Kontak</dt>
              <dd className="font-mono text-xs text-primary">{detailTarget.customerPhone}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Tanggal Pengajuan</dt>
              <dd className="text-primary">{formatDateID(detailTarget.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-4 pt-3">
              <dt className="font-semibold text-primary">Total Biaya</dt>
              <dd className="tabular-nums font-display text-lg font-bold text-primary">
                {formatRupiah(detailTarget.totalPrice)}
              </dd>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container space-y-4 py-10">
          {[0, 1, 2].map((item) => (
            <div key={item} className="skeleton h-32 w-full rounded-2xl" />
          ))}
        </div>
      }
    >
      <MyBookingsContent />
    </Suspense>
  );
}
