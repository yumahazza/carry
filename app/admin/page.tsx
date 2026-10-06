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
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#474dec] border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-32 text-center">
        <div className="rounded-xl border border-[#f87171]/20 bg-[#f87171]/10 p-6 text-sm text-[#f87171] max-w-md mx-auto">
          Gagal memuat data analitik. Pastikan Anda masuk dengan hak akses Admin.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-1">Overview & Metrics</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
          <p className="text-xs text-[#aaaaaa] mt-1">Pantau performa rental Carry dan status operasional armada secara real-time.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/bookings"
            className="px-4 py-2 bg-[#474dec] text-white text-xs font-semibold rounded-md hover:bg-[#3a39e0] transition-colors"
          >
            Kelola Booking &rarr;
          </Link>
          <Link
            href="/cars"
            className="px-4 py-2 border border-white/10 bg-white/5 text-white text-xs font-medium rounded-md hover:bg-white/10 transition-colors"
          >
            Daftar Armada
          </Link>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Card 1: Total Armada */}
        <div className="bg-[#1f1f1f] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider">Total Armada</span>
            <span className="w-2 h-2 rounded-full bg-white/20"></span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">{stats.totalCars}</h2>
          <p className="text-xs text-[#aaaaaa]">Unit mobil terdaftar</p>
        </div>

        {/* Card 2: Mobil Tersedia */}
        <div className="bg-[#1f1f1f] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider">Armada Siap Pakai</span>
            <span className="w-2 h-2 rounded-full bg-[#4ade80]"></span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#4ade80] mb-2">{stats.availableCars}</h2>
          <p className="text-xs text-[#aaaaaa]">Siap untuk disewakan</p>
        </div>

        {/* Card 3: Total Booking */}
        <div className="bg-[#1f1f1f] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider">Total Reservasi</span>
            <span className="w-2 h-2 rounded-full bg-[#474dec]"></span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">{stats.totalBookings}</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#facc15] font-medium">{stats.pendingBookings} Pending</span>
            <span className="text-[#666666]">•</span>
            <span className="text-[#4ade80] font-medium">{stats.confirmedBookings} Confirmed</span>
          </div>
        </div>

        {/* Card 4: Estimasi Pendapatan */}
        <div className="bg-[#1f1f1f] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider">Estimasi Revenue</span>
            <span className="w-2 h-2 rounded-full bg-[#60a5fa]"></span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2 truncate">
            Rp {stats.totalRevenue.toLocaleString('id-ID')}
          </h2>
          <p className="text-xs text-[#aaaaaa]">Confirmed & Completed</p>
        </div>
      </div>

      {/* Quick Summary Box */}
      <div className="rounded-xl border border-white/5 bg-[#1f1f1f] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#aaaaaa] mb-4">Aktivitas & Navigasi Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/bookings"
            className="flex items-center justify-between p-4 rounded-lg bg-[#141414] border border-white/5 hover:border-white/10 transition-colors group"
          >
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-[#474dec] transition-colors">
                Manajemen Booking
              </p>
              <p className="text-xs text-[#aaaaaa] mt-0.5">
                Konfirmasi, tolak, atau selesaikan pesanan customer
              </p>
            </div>
            <span className="text-xs text-[#aaaaaa] group-hover:text-white transition-colors">&rarr;</span>
          </Link>

          <Link
            href="/cars"
            className="flex items-center justify-between p-4 rounded-lg bg-[#141414] border border-white/5 hover:border-white/10 transition-colors group"
          >
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-[#474dec] transition-colors">
                Katalog Armada
              </p>
              <p className="text-xs text-[#aaaaaa] mt-0.5">
                Lihat dan periksa status ketersediaan armada mobil
              </p>
            </div>
            <span className="text-xs text-[#aaaaaa] group-hover:text-white transition-colors">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}