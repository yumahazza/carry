'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  car: {
    id: string;
    name: string;
    brand: string;
    image?: string;
  };
}

function MyBookingsContent() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/my-bookings');
        const data = await res.json();
        if (Array.isArray(data)) setBookings(data);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'CONFIRMED':
        return 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20';
      case 'PENDING':
        return 'bg-[#facc15]/10 text-[#facc15] border-[#facc15]/20';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20';
      case 'COMPLETED':
        return 'bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/20';
      default:
        return 'bg-white/5 text-[#aaaaaa] border-white/10';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pt-28 pb-16">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-1">Customer Area</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">My Trips</h1>
        <p className="mt-1 text-sm text-[#aaaaaa]">Kelola reservasi sewa kendaraan aktif dan riwayat perjalanan Anda.</p>
      </div>

      {isSuccess && (
        <div className="mb-8 rounded-lg border border-[#4ade80]/20 bg-[#4ade80]/10 p-4 text-xs font-medium text-[#4ade80] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"></span>
          Reservasi berhasil dikirim! Menunggu konfirmasi dari admin.
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#aaaaaa]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#474dec] border-t-transparent mb-4"></div>
          <p className="text-sm">Memuat data perjalanan...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#1f1f1f]/30 py-24 text-center">
          <p className="text-base font-semibold text-white">Belum Ada Perjalanan</p>
          <p className="mt-1.5 text-xs text-[#aaaaaa]">Mulai perjalanan Anda dengan memesan armada Carry sekarang.</p>
          <Link 
            href="/cars" 
            className="mt-6 rounded-md bg-[#474dec] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#3a39e0] transition-colors"
          >
            Explore Fleet
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="group flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-xl border border-white/5 bg-[#1f1f1f] p-5 hover:border-white/10 transition-colors"
            >
              {/* Thumbnail */}
              <div className="aspect-[16/10] w-full sm:w-36 flex-shrink-0 overflow-hidden rounded-lg bg-[#141414] border border-white/5">
                <img 
                  src={booking.car.image || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80"} 
                  alt={booking.car.name} 
                  className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-200" 
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h3 className="text-base font-bold tracking-tight text-white truncate">{booking.car.name}</h3>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-xs text-[#aaaaaa]">
                  {booking.car.brand}
                </p>
                <p className="text-xs text-[#d1d5db] mt-2 font-mono">
                  {formatDate(booking.startDate)} &mdash; {formatDate(booking.endDate)}
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <div className="text-left sm:text-right">
                  <p className="text-xs text-[#aaaaaa] uppercase tracking-wider font-medium">Total Biaya</p>
                  <p className="text-base font-bold text-white">Rp {booking.totalPrice.toLocaleString('id-ID')}</p>
                </div>
                <Link 
                  href={`/cars/${booking.car.id}`}
                  className="rounded-md border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10"
                >
                  Detail Armada
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#474dec] border-t-transparent"></div>
      </div>
    }>
      <MyBookingsContent />
    </Suspense>
  );
}