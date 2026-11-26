'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
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

interface AdminBookingRow {
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
  };
}

type StatusFilter = 'ALL' | CanonicalBookingStatus;

const VALID_FILTERS: StatusFilter[] = [
  'ALL',
  'PENDING',
  'APPROVED',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
];

function AdminBookingsContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const rawQueryParam = searchParams.get('status') || '';
  const normalizedQueryStatus = (rawQueryParam.toUpperCase() || 'ALL') as StatusFilter;
  const derivedQueryFilter: StatusFilter = VALID_FILTERS.includes(normalizedQueryStatus)
    ? normalizedQueryStatus
    : 'ALL';

  const [overrideState, setOverrideState] = useState<{
    queryKey: string;
    filter: StatusFilter;
  } | null>(null);

  const statusFilter: StatusFilter =
    overrideState && overrideState.queryKey === rawQueryParam
      ? overrideState.filter
      : derivedQueryFilter;

  const setStatusFilter = useCallback(
    (next: StatusFilter) => {
      setOverrideState({ queryKey: rawQueryParam, filter: next });
    },
    [rawQueryParam]
  );

  const [search, setSearch] = useState('');

  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadTick, setReloadTick] = useState(0);

  const [transitionTarget, setTransitionTarget] = useState<{
    booking: AdminBookingRow;
    nextStatus: CanonicalBookingStatus;
  } | null>(null);
  const [updating, setUpdating] = useState(false);
  const [detailBooking, setDetailBooking] = useState<AdminBookingRow | null>(null);

  const handleReload = useCallback(() => {
    setLoading(true);
    setError('');
    setReloadTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/bookings', { credentials: 'include' });
        if (!res.ok) throw new Error('Gagal memuat daftar booking.');
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setBookings(data);
      } catch {
        if (!cancelled) {
          setError('Gagal mengambil data booking. Pastikan Anda memiliki akses Admin.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
      if (q) {
        return (
          b.customerName.toLowerCase().includes(q) ||
          b.customerEmail.toLowerCase().includes(q) ||
          b.customerPhone.toLowerCase().includes(q) ||
          b.car.name.toLowerCase().includes(q) ||
          b.car.brand.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bookings, statusFilter, search]);

  const executeStatusTransition = async () => {
    if (!transitionTarget) return;
    setUpdating(true);
    try {
      const res = await fetch(
        `/api/admin/bookings/${transitionTarget.booking.id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: transitionTarget.nextStatus }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        showToast({
          title: 'Gagal mengubah status booking',
          description: data.error || 'Transisi status tidak diizinkan.',
          variant: 'danger',
        });
        return;
      }

      setBookings((prev) =>
        prev.map((item) =>
          item.id === transitionTarget.booking.id
            ? { ...item, status: transitionTarget.nextStatus }
            : item
        )
      );

      const statusLabels: Record<CanonicalBookingStatus, string> = {
        PENDING: 'Pending',
        APPROVED: 'Approved',
        REJECTED: 'Rejected',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled',
      };

      showToast({
        title: `Status diperbarui ke ${statusLabels[transitionTarget.nextStatus]}.`,
        description: `Pesanan ${transitionTarget.booking.customerName} (${transitionTarget.booking.car.name}) telah disinkronkan.`,
        variant: 'success',
      });
      setTransitionTarget(null);
    } catch {
      showToast({
        title: 'Koneksi gagal',
        description: 'Tidak dapat menghubungi server saat ini.',
        variant: 'danger',
      });
    } finally {
      setUpdating(false);
    }
  };

  const getTransitionDescription = () => {
    if (!transitionTarget) return '';
    const { booking, nextStatus } = transitionTarget;
    switch (nextStatus) {
      case 'APPROVED':
        return `Menyetujui pesanan ${booking.customerName} akan mengunci unit ${booking.car.name} menjadi Rented.`;
      case 'REJECTED':
        return `Menolak pesanan ${booking.customerName} untuk ${booking.car.name}. Status unit tetap Available.`;
      case 'COMPLETED':
        return `Menandai perjalanan ${booking.customerName} telah selesai. Unit ${booking.car.name} akan kembali menjadi Available.`;
      case 'CANCELLED':
        return booking.status === 'APPROVED'
          ? `Membatalkan pesanan berstatus Approved ini akan mengembalikan ketersediaan ${booking.car.name} menjadi Available.`
          : `Membatalkan permintaan booking ${booking.customerName} untuk ${booking.car.name}.`;
      default:
        return '';
    }
  };

  const filterTabs: { id: StatusFilter; label: string }[] = [
    { id: 'ALL', label: 'Semua' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' },
    { id: 'REJECTED', label: 'Rejected' },
  ];

  const hasFilter = statusFilter !== 'ALL' || search.trim() !== '';

  const renderRowActions = (booking: AdminBookingRow) => (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {booking.status === 'PENDING' && (
        <>
          <button
            type="button"
            onClick={() => setTransitionTarget({ booking, nextStatus: 'APPROVED' })}
            className="btn-success-soft btn-sm"
          >
            Setujui
          </button>
          <button
            type="button"
            onClick={() => setTransitionTarget({ booking, nextStatus: 'REJECTED' })}
            className="btn-danger-soft btn-sm"
          >
            Tolak
          </button>
        </>
      )}
      {booking.status === 'APPROVED' && (
        <>
          <button
            type="button"
            onClick={() => setTransitionTarget({ booking, nextStatus: 'COMPLETED' })}
            className="btn-info-soft btn-sm"
          >
            Selesaikan
          </button>
          <button
            type="button"
            onClick={() => setTransitionTarget({ booking, nextStatus: 'CANCELLED' })}
            className="btn-danger-soft btn-sm"
          >
            Batalkan
          </button>
        </>
      )}
      <button
        type="button"
        onClick={() => setDetailBooking(booking)}
        className="btn-ghost btn-sm"
      >
        Detail
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header (DSG §20.5) */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-primary sm:text-3xl">
          Manajemen Booking
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Verifikasi permintaan sewa pelanggan, selesaikan perjalanan berjalan, dan sinkronkan ketersediaan armada.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-3">
        <div
          role="group"
          aria-label="Filter status booking"
          className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-[10px] border border-border-control bg-surface p-1"
        >
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.id;
            const count =
              tab.id === 'ALL'
                ? bookings.length
                : bookings.filter((b) => b.status === tab.id).length;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => setStatusFilter(tab.id)}
                className={`min-h-9 rounded-lg px-3 text-[13px] transition-colors ${
                  active
                    ? 'bg-brand-soft font-semibold text-text-brand'
                    : 'font-medium text-secondary hover:text-primary'
                }`}
              >
                {tab.label}{' '}
                <span className="ml-1 tabular-nums text-xs opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <label htmlFor="admin-booking-search" className="sr-only">
              Cari nama penyewa, kontak, kode booking, atau mobil
            </label>
            <input
              id="admin-booking-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari penyewa, nomor telepon, kode, atau nama mobil..."
              className="field-control"
            />
          </div>

          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setSearch('');
              }}
              className="btn-ghost btn-sm self-start sm:self-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Data Views */}
      {loading ? (
        <div aria-label="Memuat daftar booking" aria-live="polite" className="space-y-3">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div key={idx} className="skeleton h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="alert-box alert-danger flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>
          <button type="button" onClick={handleReload} className="btn-secondary shrink-0">
            Coba Lagi
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-control bg-surface px-6 py-14 text-center">
          <h2 className="font-display text-lg font-semibold text-primary">
            Belum ada permintaan booking
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-secondary">
            Pesanan baru yang diajukan pelanggan dari halaman detail mobil akan tampil di sini.
          </p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-control bg-surface px-6 py-12 text-center">
          <h2 className="font-display text-lg font-semibold text-primary">
            Tidak ada data yang cocok
          </h2>
          <p className="mt-1.5 text-sm text-secondary">
            Coba ubah status filter atau kata kunci pencarian.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ALL');
              setSearch('');
            }}
            className="btn-secondary mt-4"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table (>= 768px: DSG §20.5) */}
          <div className="data-table-wrap hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Penyewa</th>
                  <th>Kendaraan</th>
                  <th>Periode Sewa</th>
                  <th className="text-right">Total Biaya</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <p
                        title={booking.customerName}
                        className="max-w-[180px] truncate font-semibold text-primary"
                      >
                        {booking.customerName}
                      </p>
                      <p className="font-mono text-xs text-secondary">
                        {booking.customerPhone}
                      </p>
                    </td>
                    <td>
                      <p
                        title={`${booking.car.brand} ${booking.car.name}`}
                        className="max-w-[190px] truncate font-medium text-primary"
                      >
                        {booking.car.name}
                      </p>
                      <p className="text-xs text-muted">
                        {booking.car.brand} &bull;{' '}
                        <span className="font-mono">{formatBookingCode(booking.id)}</span>
                      </p>
                    </td>
                    <td className="whitespace-nowrap text-secondary">
                      {formatDateRangeID(booking.startDate, booking.endDate)}
                    </td>
                    <td className="whitespace-nowrap text-right tabular-nums font-semibold text-primary">
                      {formatRupiah(booking.totalPrice)}
                    </td>
                    <td>
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td>{renderRowActions(booking)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (< 768px: DSG §11.8 Responsive Rule) */}
          <div className="space-y-3 md:hidden">
            {filteredBookings.map((booking) => (
              <article key={booking.id} className="surface-card space-y-3.5 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-base font-semibold text-primary">
                      {booking.customerName}
                    </h2>
                    <p className="font-mono text-xs text-secondary">{booking.customerPhone}</p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>

                <dl className="space-y-2 border-y border-border-subtle py-3 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Kendaraan</dt>
                    <dd className="font-medium text-primary">
                      {booking.car.brand} {booking.car.name}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Periode</dt>
                    <dd className="text-primary">
                      {formatDateRangeID(booking.startDate, booking.endDate)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Total Biaya</dt>
                    <dd className="tabular-nums font-semibold text-primary">
                      {formatRupiah(booking.totalPrice)}
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-2">{renderRowActions(booking)}</div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Modal for Lifecycle Transitions (DSG §20.5) */}
      <Modal
        open={Boolean(transitionTarget)}
        onClose={() => !updating && setTransitionTarget(null)}
        title={
          transitionTarget?.nextStatus === 'APPROVED'
            ? 'Setujui pesanan ini?'
            : transitionTarget?.nextStatus === 'COMPLETED'
              ? 'Tandai pesanan selesai?'
              : transitionTarget?.nextStatus === 'REJECTED'
                ? 'Tolak permintaan booking?'
                : 'Batalkan pesanan ini?'
        }
        danger={
          transitionTarget?.nextStatus === 'REJECTED' ||
          transitionTarget?.nextStatus === 'CANCELLED'
        }
        description={getTransitionDescription()}
        footer={
          <>
            <button
              type="button"
              disabled={updating}
              onClick={() => setTransitionTarget(null)}
              className="btn-secondary w-full sm:w-auto"
            >
              Kembali
            </button>
            <button
              type="button"
              disabled={updating}
              onClick={executeStatusTransition}
              className={
                transitionTarget?.nextStatus === 'REJECTED' ||
                transitionTarget?.nextStatus === 'CANCELLED'
                  ? 'btn-danger-solid w-full sm:w-auto'
                  : 'btn-primary w-full sm:w-auto'
              }
            >
              {updating ? 'Memproses...' : 'Konfirmasi'}
            </button>
          </>
        }
      />

      {/* Booking Detail Modal */}
      <Modal
        open={Boolean(detailBooking)}
        onClose={() => setDetailBooking(null)}
        title="Detail Permintaan Booking"
        size="md"
        footer={
          <button
            type="button"
            onClick={() => setDetailBooking(null)}
            className="btn-secondary w-full sm:w-auto"
          >
            Tutup
          </button>
        }
      >
        {detailBooking && (
          <dl className="divide-y divide-border-subtle text-sm">
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Kode Booking</dt>
              <dd className="font-mono font-semibold text-primary">
                {formatBookingCode(detailBooking.id)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Status</dt>
              <dd>
                <BookingStatusBadge status={detailBooking.status} />
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Nama Penyewa</dt>
              <dd className="font-medium text-primary">{detailBooking.customerName}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Email</dt>
              <dd className="text-primary">{detailBooking.customerEmail}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Telepon</dt>
              <dd className="font-mono text-xs text-primary">{detailBooking.customerPhone}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Kendaraan</dt>
              <dd className="font-medium text-primary">
                {detailBooking.car.brand} {detailBooking.car.name}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Periode Sewa</dt>
              <dd className="text-primary">
                {formatDateRangeID(detailBooking.startDate, detailBooking.endDate)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-secondary">Waktu Dibuat</dt>
              <dd className="text-primary">{formatDateID(detailBooking.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-4 pt-3">
              <dt className="font-semibold text-primary">Total Biaya</dt>
              <dd className="tabular-nums font-display text-lg font-bold text-primary">
                {formatRupiah(detailBooking.totalPrice)}
              </dd>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  );
}

export default function AdminBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div key={idx} className="skeleton h-14 w-full rounded-xl" />
          ))}
        </div>
      }
    >
      <AdminBookingsContent />
    </Suspense>
  );
}
