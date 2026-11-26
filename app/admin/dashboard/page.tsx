'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { type CanonicalBookingStatus, formatRupiah } from '@/lib/format';

interface CarRecord {
  id: string;
  name: string;
  brand: string;
  isAvailable: boolean;
  pricePerDay: number;
}

interface BookingRecord {
  id: string;
  totalPrice: number;
  status: CanonicalBookingStatus;
  createdAt: string;
}

type PeriodFilter = 'all' | '30d' | '7d' | 'today';

export default function AdminAnalyticsDashboardPage() {
  const [cars, setCars] = useState<CarRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<PeriodFilter>('all');

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
        const [carsRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/cars', { credentials: 'include' }),
          fetch('/api/admin/bookings', { credentials: 'include' }),
        ]);

        if (!carsRes.ok || !bookingsRes.ok) {
          throw new Error('Gagal memuat data analitik.');
        }

        const [carsData, bookingsData] = await Promise.all([
          carsRes.json(),
          bookingsRes.json(),
        ]);

        if (!cancelled) {
          if (Array.isArray(carsData)) setCars(carsData);
          if (Array.isArray(bookingsData)) setBookings(bookingsData);
        }
      } catch {
        if (!cancelled) {
          setError('Gagal memuat data analitik. Pastikan sesi Admin Anda masih aktif.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const periodBookings = useMemo(() => {
    if (period === 'all') return bookings;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const cutoff =
      period === 'today'
        ? startOfToday
        : period === '7d'
          ? now.getTime() - 7 * 24 * 60 * 60 * 1000
          : now.getTime() - 30 * 24 * 60 * 60 * 1000;

    return bookings.filter((b) => new Date(b.createdAt).getTime() >= cutoff);
  }, [bookings, period]);

  const metrics = useMemo(() => {
    const totalCars = cars.length;
    const availableCars = cars.filter((c) => c.isAvailable).length;
    const pending = periodBookings.filter((b) => b.status === 'PENDING').length;
    const approved = periodBookings.filter((b) => b.status === 'APPROVED').length;
    const completed = periodBookings.filter((b) => b.status === 'COMPLETED').length;
    const cancelled = periodBookings.filter((b) => b.status === 'CANCELLED').length;
    const rejected = periodBookings.filter((b) => b.status === 'REJECTED').length;

    const revenue = periodBookings
      .filter((b) => b.status === 'APPROVED' || b.status === 'COMPLETED')
      .reduce((acc, b) => acc + b.totalPrice, 0);

    return {
      totalCars,
      availableCars,
      rentedCars: totalCars - availableCars,
      totalBookings: periodBookings.length,
      pending,
      approved,
      completed,
      cancelled,
      rejected,
      revenue,
    };
  }, [cars, periodBookings]);

  const brandUtilization = useMemo(() => {
    const map = new Map<string, { total: number; rented: number; available: number }>();
    for (const car of cars) {
      const key = car.brand || 'Lainnya';
      const entry = map.get(key) ?? { total: 0, rented: 0, available: 0 };
      entry.total += 1;
      if (car.isAvailable) entry.available += 1;
      else entry.rented += 1;
      map.set(key, entry);
    }
    return Array.from(map.entries())
      .map(([brand, data]) => ({ brand, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [cars]);

  if (loading) {
    return (
      <div aria-label="Memuat dashboard analitik" aria-live="polite" className="space-y-6">
        <div className="skeleton h-16 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="alert-box alert-danger flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="font-semibold">Gagal memuat analitik.</p>
          <p className="mt-0.5 text-sm text-secondary">{error}</p>
        </div>
        <button type="button" onClick={handleReload} className="btn-secondary shrink-0">
          Coba Lagi
        </button>
      </div>
    );
  }

  const statusSeries = [
    { label: 'Pending', count: metrics.pending, barClass: 'bg-warning' },
    { label: 'Approved', count: metrics.approved, barClass: 'bg-brand' },
    { label: 'Completed', count: metrics.completed, barClass: 'bg-success' },
    { label: 'Cancelled', count: metrics.cancelled, barClass: 'bg-danger' },
    { label: 'Rejected', count: metrics.rejected, barClass: 'bg-muted' },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Real Period Filter (DSG §20.1) */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-primary sm:text-3xl">
            Dashboard Analitik
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Ringkasan performa armada dan realisasi transaksi berdasarkan data aktual database.
          </p>
        </div>

        <div
          role="group"
          aria-label="Filter periode waktu"
          className="inline-flex flex-wrap items-center gap-1 rounded-[10px] border border-border-control bg-surface p-1"
        >
          {(
            [
              { id: 'today', label: 'Hari Ini' },
              { id: '7d', label: '7 Hari' },
              { id: '30d', label: '30 Hari' },
              { id: 'all', label: 'Semua' },
            ] as const
          ).map((item) => {
            const active = period === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setPeriod(item.id)}
                className={`min-h-9 rounded-lg px-3 text-[13px] transition-colors ${
                  active
                    ? 'bg-brand-soft font-semibold text-text-brand'
                    : 'font-medium text-secondary hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stat Cards (DSG §20.2: real numbers, no invented deltas) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <div className="surface-card p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Total Armada
          </p>
          <p className="mt-2 tabular-nums font-display text-[26px] font-bold text-primary sm:text-[32px]">
            {metrics.totalCars}
          </p>
          <p className="mt-1 text-[13px] text-secondary">
            <span className="font-medium text-success">{metrics.availableCars} Available</span>
            {' · '}
            <span>{metrics.rentedCars} Rented</span>
          </p>
        </div>

        <div className="surface-card p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Total Booking
          </p>
          <p className="mt-2 tabular-nums font-display text-[26px] font-bold text-primary sm:text-[32px]">
            {metrics.totalBookings}
          </p>
          <p className="mt-1 text-[13px] text-secondary">
            {metrics.pending} menunggu persetujuan
          </p>
        </div>

        <div className="surface-card p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Pesanan Terealisasi
          </p>
          <p className="mt-2 tabular-nums font-display text-[26px] font-bold text-primary sm:text-[32px]">
            {metrics.approved + metrics.completed}
          </p>
          <p className="mt-1 text-[13px] text-secondary">
            {metrics.approved} Approved · {metrics.completed} Completed
          </p>
        </div>

        <div className="surface-card p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Estimasi Pendapatan
          </p>
          <p className="mt-2 truncate tabular-nums font-display text-[22px] font-bold text-primary sm:text-[26px]">
            {formatRupiah(metrics.revenue)}
          </p>
          <p className="mt-1 text-[13px] text-secondary">
            Dari pesanan Approved &amp; Completed
          </p>
        </div>
      </div>

      {/* Charts Area Answering Explicit Questions (DSG §20.3 + antislop-ui) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Booking Status Distribution */}
        <section className="surface-card rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-primary">
            Bagaimana distribusi status pesanan pada periode ini?
          </h2>
          <p className="mt-1 text-xs text-muted">
            Perbandingan jumlah reservasi berdasarkan status siklus hidup booking.
          </p>

          {metrics.totalBookings === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-border-control px-4 py-10 text-center">
              <p className="text-sm font-medium text-primary">
                Belum ada transaksi pada periode terpilih.
              </p>
              <p className="mt-1 text-xs text-secondary">
                Pilih rentang waktu Semua atau tunggu pesanan masuk dari pelanggan.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {statusSeries.map((row) => {
                const pct =
                  metrics.totalBookings > 0
                    ? Math.round((row.count / metrics.totalBookings) * 100)
                    : 0;
                return (
                  <div key={row.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-primary">{row.label}</span>
                      <span className="tabular-nums text-xs text-secondary">
                        {row.count} pesanan ({pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-overlay">
                      <div
                        style={{ width: `${Math.max(row.count > 0 ? 4 : 0, pct)}%` }}
                        className={`h-full rounded-full ${row.barClass}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Chart 2: Fleet Brand Utilization */}
        <section className="surface-card rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-primary">
            Berapa porsi unit yang siap jalan dibanding sedang disewa per merek?
          </h2>
          <p className="mt-1 text-xs text-muted">
            Ketersediaan armada saat ini untuk membantu perencanaan penambahan unit.
          </p>

          {brandUtilization.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-border-control px-4 py-10 text-center">
              <p className="text-sm font-medium text-primary">Belum ada armada terdaftar.</p>
              <Link href="/admin/cars/new" className="btn-secondary btn-sm mt-3">
                Tambah Mobil Pertama
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {brandUtilization.map((item) => {
                const availPct = Math.round((item.available / item.total) * 100);
                return (
                  <div key={item.brand}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-primary">{item.brand}</span>
                      <span className="tabular-nums text-xs text-secondary">
                        {item.available} Available · {item.rented} Rented ({item.total} unit)
                      </span>
                    </div>
                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-overlay">
                      {item.available > 0 && (
                        <div
                          style={{ width: `${availPct}%` }}
                          className="h-full bg-success"
                          title={`${item.available} Available`}
                        />
                      )}
                      {item.rented > 0 && (
                        <div
                          style={{ width: `${100 - availPct}%` }}
                          className="h-full bg-danger"
                          title={`${item.rented} Rented`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Navigation to Data Management Modules */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/cars"
          className="interactive-card flex items-center justify-between gap-4 p-5 focus-visible:outline-none"
        >
          <div>
            <h3 className="font-display text-base font-semibold text-primary">
              Buka Tabel Manajemen Mobil
            </h3>
            <p className="mt-1 text-sm text-secondary">
              Tambah unit baru, perbarui tarif harian, atau kelola ketersediaan armada.
            </p>
          </div>
          <span className="text-sm font-semibold text-text-brand">Kelola</span>
        </Link>

        <Link
          href="/admin/bookings"
          className="interactive-card flex items-center justify-between gap-4 p-5 focus-visible:outline-none"
        >
          <div>
            <h3 className="font-display text-base font-semibold text-primary">
              Buka Tabel Manajemen Booking
            </h3>
            <p className="mt-1 text-sm text-secondary">
              Filter status reservasi dan proses persetujuan atau penyelesaian sewa.
            </p>
          </div>
          <span className="text-sm font-semibold text-text-brand">Kelola</span>
        </Link>
      </div>
    </div>
  );
}
