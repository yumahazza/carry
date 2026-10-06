'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Car {
  id: string;
  name: string;
  brand: string;
  year: number;
  pricePerDay: number;
  isAvailable: boolean;
  image?: string;
  description?: string;
  seats?: number;
  transmission?: string;
  fuel?: string;
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await fetch(`/api/cars/${id}`);
        if (!res.ok) throw new Error('Car not found');
        const data = await res.json();
        setCar(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const calculateTotal = () => {
    if (!startDate || !endDate || !car) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * car.pricePerDay : 0;
  };

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      setError('Please select start and end dates.');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError('End date must be after start date.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: car?.id,
          startDate,
          endDate,
          totalPrice: calculateTotal(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create booking');
      }

      router.push('/my-bookings?success=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#474dec] border-t-transparent"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">Car Not Found</h1>
        <Link href="/cars" className="mt-4 inline-block text-[#474dec] hover:underline">
          ← Back to Fleet
        </Link>
      </div>
    );
  }

  const total = calculateTotal();
  const defaultImage = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2 text-sm text-[#aaaaaa]">
        <Link href="/cars" className="hover:text-white transition-colors">Fleet</Link>
        <span>/</span>
        <span className="text-white">{car.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* LEFT COLUMN: Image & Gallery */}
        <div className="space-y-6">
          <div className="aspect-[16/10] overflow-hidden rounded-xl border border-white/5 bg-[#1f1f1f]">
            <img 
              src={car.image || defaultImage} 
              alt={car.name} 
              className="h-full w-full object-cover" 
            />
          </div>
          
          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-white/5 bg-[#1f1f1f] p-4 text-center">
              <p className="text-xs text-[#aaaaaa] mb-1">Seats</p>
              <p className="text-lg font-semibold text-white">{car.seats || '5'}</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-[#1f1f1f] p-4 text-center">
              <p className="text-xs text-[#aaaaaa] mb-1">Transmission</p>
              <p className="text-lg font-semibold text-white">{car.transmission || 'Auto'}</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-[#1f1f1f] p-4 text-center">
              <p className="text-xs text-[#aaaaaa] mb-1">Fuel</p>
              <p className="text-lg font-semibold text-white">{car.fuel || 'Petrol'}</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Booking */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{car.name}</h1>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                car.isAvailable ? 'bg-[#4ade80]/10 text-[#4ade80]' : 'bg-[#f87171]/10 text-[#f87171]'
              }`}>
                {car.isAvailable ? 'Available' : 'Rented'}
              </span>
            </div>
            <p className="text-[#aaaaaa]">{car.brand} • {car.year}</p>
          </div>

          <p className="text-[#cccccc] leading-relaxed">
            {car.description || `Experience the perfect blend of luxury and performance with the ${car.name}. Ideal for both city driving and long journeys, this ${car.year} model ensures a smooth and comfortable ride.`}
          </p>

          {/* Booking Card */}
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6 space-y-6">
            <div className="flex items-baseline justify-between border-b border-white/5 pb-4">
              <p className="text-2xl font-bold text-white">
                Rp {car.pricePerDay.toLocaleString()}
                <span className="text-sm font-normal text-[#aaaaaa]"> / day</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider">Start Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider">End Date</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {total > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[#aaaaaa]">Total Estimated Price</span>
                <span className="text-xl font-bold text-white">Rp {total.toLocaleString()}</span>
              </div>
            )}

            <button 
              onClick={handleBooking}
              disabled={!car.isAvailable || isSubmitting}
              className="w-full rounded-md bg-[#474dec] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#3a39e0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                'Reserve Now'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}