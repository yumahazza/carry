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
        return 'status-success';
      case 'PENDING':
        return 'status-warning';
      case 'REJECTED':
      case 'CANCELLED':
        return 'status-danger';
      case 'COMPLETED':
        return 'status-info';
      default:
        return 'status-neutral';
    }
  };

  const getStatusLabel = (status: Booking['status']) => {
    const labels: Record<Booking['status'], string> = {
      PENDING: 'Pending',
      APPROVED: 'Approved',
      CONFIRMED: 'Confirmed',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };
    return labels[status];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="page-container py-10 sm:py-14">
      {/* Header */}
      <div className="mb-7">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Customer Area</p>
        <h1 className="text-3xl font-bold tracking-tight text-primary">My Bookings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-secondary">Kelola reservasi sewa kendaraan aktif dan riwayat perjalanan Anda.</p>
      </div>

      {isSuccess && (
        <div role="status" aria-live="polite" className="mb-6 flex items-start gap-3 rounded-xl border border-[rgba(52,211,153,0.28)] bg-[rgba(52,211,153,0.12)] p-4 text-sm font-medium text-success">
          <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-success"></span>
          Reservasi berhasil dikirim! Menunggu konfirmasi dari admin.
        </div>
      )}

      {loading ? (
        <div aria-label="Memuat riwayat booking" aria-live="polite" className="space-y-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="skeleton aspect-[16/10] w-full rounded-lg sm:h-[84px] sm:w-[120px]" />
              <div className="flex-1 space-y-3">
                <div className="skeleton h-5 w-2/3" />
                <div className="skeleton h-4 w-1/2" />
              </div>
              <div className="skeleton h-10 w-full sm:w-40" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-surface/50 px-5 py-16 text-center">
          <h2 className="text-lg font-semibold text-primary">No active bookings</h2>
          <p className="mt-2 max-w-md text-sm text-secondary">Belum ada perjalanan. Jelajahi armada untuk memulai perjalanan pertama Anda.</p>
          <Link 
            href="/cars" 
            className="btn-primary mt-6 w-full sm:w-auto"
          >
            Explore Fleet
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="interactive-card group flex flex-col items-start gap-4 rounded-xl border border-border-subtle bg-surface p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5"
            >
              {/* Thumbnail */}
              <div className="aspect-[16/10] w-full flex-shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-surface-raised sm:h-[84px] sm:w-[120px]">
                <img 
                  src={booking.car.image || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80"} 
                  alt={booking.car.name} 
                  className="h-full w-full object-cover transition-transform duration-[260ms] group-hover:scale-[1.03]"
                />
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                  <h3 className="truncate text-lg font-semibold tracking-tight text-primary">{booking.car.name}</h3>
                  <span className={`status-badge ${getStatusBadge(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
                <p className="text-sm text-secondary">
                  {booking.car.brand}
                </p>
                <p className="mt-2 text-sm text-secondary">
                  {formatDate(booking.startDate)} &mdash; {formatDate(booking.endDate)}
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex w-full items-center justify-between gap-4 border-t border-border-subtle pt-4 sm:w-auto sm:justify-end sm:border-t-0 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className="text-xs font-medium text-muted">Total Biaya</p>
                  <p className="tabular-nums text-lg font-bold text-primary">Rp {booking.totalPrice.toLocaleString('id-ID')}</p>
                </div>
                <Link 
                  href={`/cars/${booking.car.id}`}
                  className="btn-secondary min-h-11"
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
      <div aria-label="Memuat riwayat booking" aria-live="polite" className="page-container space-y-4 py-10 sm:py-14">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="skeleton aspect-[16/10] w-full rounded-lg sm:h-[84px] sm:w-[120px]" />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-5 w-2/3" />
              <div className="skeleton h-4 w-1/2" />
            </div>
            <div className="skeleton h-10 w-full sm:w-40" />
          </div>
        ))}
      </div>
    }>
      <MyBookingsContent />
    </Suspense>
  );
}