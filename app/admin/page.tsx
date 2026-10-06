'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalCars: number;
  availableCars: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Gagal fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div aria-label="Memuat ringkasan admin" aria-live="polite" className="page-container-wide space-y-6 py-10">
        <div className="skeleton h-20 rounded-xl" />
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="skeleton h-36 rounded-xl" />)}
        </div>
        <div className="skeleton h-44 rounded-xl" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page-container py-16 text-center sm:py-24">
        <div role="alert" className="mx-auto max-w-md rounded-xl border border-[rgba(251,113,133,0.28)] bg-[rgba(251,113,133,0.12)] p-5 text-sm leading-relaxed text-danger">
          Gagal memuat data analitik. Pastikan Anda masuk dengan hak akses Admin.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container-wide py-8 sm:py-10">
      {/* Header */}
      <div className="mb-7 flex flex-col items-start justify-between gap-5 border-b border-border-subtle pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#a5b4fc]">
            Overview & Metrics
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-secondary">
            Pantau performa rental Carry dan status operasional armada secara real-time.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/bookings"
            className="btn-primary w-full sm:w-auto"
          >
            Kelola Booking &rarr;
          </Link>
          <Link
            href="/cars"
            className="btn-secondary w-full sm:w-auto"
          >
            Daftar Armada
          </Link>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {/* Card 1: Total Armada */}
        <div className="surface-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-secondary">Total Armada</span>
            <span className="status-badge status-neutral">Units</span>
          </div>
          <h2 className="mb-1 text-2xl font-bold tracking-tight tabular-nums text-primary sm:text-3xl">{stats.totalCars}</h2>
          <p className="text-xs text-secondary sm:text-sm">Unit mobil terdaftar</p>
        </div>

        {/* Card 2: Mobil Tersedia */}
        <div className="surface-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-secondary">Armada Siap Pakai</span>
            <span className="status-badge status-success">Available</span>
          </div>
          <h2 className="mb-1 text-2xl font-bold tracking-tight tabular-nums text-success sm:text-3xl">{stats.availableCars}</h2>
          <p className="text-xs text-secondary sm:text-sm">Siap untuk disewakan</p>
        </div>

        {/* Card 3: Total Booking */}
        <div className="surface-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-secondary">Total Reservasi</span>
            <span className="status-badge status-brand">Bookings</span>
          </div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight tabular-nums text-primary sm:text-3xl">{stats.totalBookings}</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="status-badge status-warning">{stats.pendingBookings} Pending</span>
            <span className="status-badge status-success">{stats.confirmedBookings} Confirmed</span>
          </div>
        </div>

        {/* Card 4: Estimasi Pendapatan */}
        <div className="surface-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-secondary">Estimasi Revenue</span>
            <span className="status-badge status-info">Revenue</span>
          </div>
          <h2 className="mb-1 truncate text-xl font-bold tracking-tight tabular-nums text-primary sm:text-2xl">
            Rp {stats.totalRevenue.toLocaleString('id-ID')}
          </h2>
          <p className="text-xs text-secondary sm:text-sm">Confirmed &amp; Completed</p>
        </div>
      </div>

      {/* Quick Summary Box */}
      <div className="surface-card p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#a5b4fc]">Pintasan</p>
            <h3 className="text-lg font-semibold tracking-tight text-primary">Aktivitas & Navigasi Cepat</h3>
          </div>
          <p className="text-xs text-muted">Akses menu operasional</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/bookings"
            className="interactive-card group flex min-h-20 items-center justify-between gap-4 rounded-lg border border-border-subtle bg-canvas p-4 focus-visible:outline-none"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary transition-colors group-hover:text-[#a5b4fc]">
                Manajemen Booking
              </p>
              <p className="mt-1 text-sm leading-relaxed text-secondary">
                Konfirmasi, tolak, atau selesaikan pesanan customer
              </p>
            </div>
            <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-default text-sm text-secondary transition-colors group-hover:border-[rgba(71,77,236,0.30)] group-hover:text-primary">&rarr;</span>
          </Link>

          <Link
            href="/cars"
            className="interactive-card group flex min-h-20 items-center justify-between gap-4 rounded-lg border border-border-subtle bg-canvas p-4 focus-visible:outline-none"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary transition-colors group-hover:text-[#a5b4fc]">
                Katalog Armada
              </p>
              <p className="mt-1 text-sm leading-relaxed text-secondary">
                Lihat dan periksa status ketersediaan armada mobil
              </p>
            </div>
            <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-default text-sm text-secondary transition-colors group-hover:border-[rgba(71,77,236,0.30)] group-hover:text-primary">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}