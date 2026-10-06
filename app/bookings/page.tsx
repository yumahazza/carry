'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  car: {
    id: string;
    name: string;
    brand: string;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (error) {
      console.error('Gagal mengambil data booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Gagal logout:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      fetchBookings();
    } else {
      alert('Gagal mengubah status booking');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'APPROVED':
        return 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20';
      case 'PENDING':
        return 'bg-[#facc15]/10 text-[#facc15] border-[#facc15]/20';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20';
      case 'COMPLETED':
        return 'bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/20';
      default:
        return 'bg-white/5 text-[#aaaaaa] border-white/10';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pt-28 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-1">Admin Operations</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Daftar Booking Masuk</h1>
          <p className="text-xs text-[#aaaaaa] mt-1">Kelola dan update status reservasi customer Carry secara langsung.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="px-3.5 py-1.5 border border-white/10 bg-white/5 text-white text-xs font-medium rounded-md hover:bg-white/10 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/cars"
            className="px-3.5 py-1.5 border border-white/10 bg-white/5 text-white text-xs font-medium rounded-md hover:bg-white/10 transition-colors"
          >
            Lihat Armada
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 text-xs font-medium text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-md hover:bg-[#f87171]/20 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#aaaaaa]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#474dec] border-t-transparent mb-4"></div>
          <p className="text-sm">Memuat data booking...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-[#1f1f1f]/30 py-20 text-center">
          <p className="text-sm text-[#aaaaaa]">Belum ada data reservasi masuk.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-[#1f1f1f] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#141414]/80 text-xs font-medium text-[#aaaaaa] uppercase tracking-wider">
                  <th className="py-3.5 px-5">Nama Armada</th>
                  <th className="py-3.5 px-5">Penyewa</th>
                  <th className="py-3.5 px-5">Periode Sewa</th>
                  <th className="py-3.5 px-5">Total Biaya</th>
                  <th className="py-3.5 px-5">Status & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-white">{booking.car.name}</div>
                      <div className="text-xs text-[#aaaaaa] mt-0.5">{booking.car.brand}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-medium text-white">{booking.customerName}</div>
                      <div className="text-xs text-[#aaaaaa] font-mono mt-0.5">{booking.customerPhone}</div>
                    </td>
                    <td className="py-4 px-5 text-xs text-[#d1d5db]">
                      <span>{formatDate(booking.startDate)}</span>
                      <span className="text-[#666666] mx-1.5">&mdash;</span>
                      <span>{formatDate(booking.endDate)}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-white">
                        Rp {booking.totalPrice.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>

                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className="bg-[#141414] border border-white/10 text-xs text-[#f3f4f6] rounded-md px-2.5 py-1 focus:outline-none focus:border-[#474dec] focus:ring-1 focus:ring-[#474dec]/50 cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}