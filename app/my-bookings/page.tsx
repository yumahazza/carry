'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  car: {
    id: string;
    name: string;
    brand: string;
    image?: string;
  };
}

export default function MyBookingsPage() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/bookings/my');
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20';
      case 'PENDING': return 'bg-[#facc15]/10 text-[#facc15] border-[#facc15]/20';
      case 'REJECTED':
      case 'CANCELLED': return 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20';
      case 'COMPLETED': return 'bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/20';
      default: return 'bg-white/5 text-[#aaaaaa] border-white/10';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">My Trips</h1>
        <p className="mt-2 text-[#aaaaaa]">Manage your current and past car rentals.</p>
      </div>

      {isSuccess && (
        <div className="mb-8 rounded-lg border border-[#4ade80]/20 bg-[#4ade80]/5 p-4 text-sm text-[#4ade80]">
          Booking submitted successfully! Waiting for admin approval.
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#474dec] border-t-transparent"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-24 text-center">
          <p className="text-xl font-medium text-white">No trips yet.</p>
          <p className="mt-2 text-sm text-[#aaaaaa]">Start your journey by booking your first car.</p>
          <Link 
            href="/cars" 
            className="mt-6 rounded-md bg-[#474dec] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3a39e0] transition-colors"
          >
            Explore Fleet
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-xl border border-white/5 bg-[#1f1f1f] p-5 transition-all hover:border-white/10">
              {/* Car Image */}
              <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-[#141414]">
                <img 
                  src={booking.car.image || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80"} 
                  alt={booking.car.name} 
                  className="h-full w-full object-cover" 
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-white truncate">{booking.car.name}</h3>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm text-[#aaaaaa]">
                  {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="text-xs text-[#aaaaaa]">Total</p>
                  <p className="text-lg font-bold text-white">Rp {booking.totalPrice.toLocaleString()}</p>
                </div>
                <Link 
                  href={`/cars/${booking.car.id}`}
                  className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  View Car
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}