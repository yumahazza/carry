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
      setError('Silakan pilih tanggal mulai dan tanggal selesai.');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError('Tanggal selesai harus setelah tanggal mulai.');
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
        throw new Error(errData.error || 'Gagal membuat booking');
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
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#474dec] border-t-transparent"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-32 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Mobil Tidak Ditemukan</h1>
        <p className="text-sm text-[#aaaaaa] mb-6">Armada yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link
          href="/cars"
          className="inline-flex items-center px-4 py-2 bg-[#474dec] text-white rounded-md text-xs font-semibold hover:bg-[#3a39e0] transition-colors"
        >
          &larr; Kembali ke Daftar Mobil
        </Link>
      </div>
    );
  }

  const total = calculateTotal();
  const defaultImage = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pt-28 pb-16">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2 text-xs text-[#aaaaaa]">
        <Link href="/cars" className="hover:text-white transition-colors">Daftar Mobil</Link>
        <span className="text-[#666666]">/</span>
        <span className="text-[#f3f4f6] font-medium">{car.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* LEFT COLUMN: Image & Specs (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          <div className="aspect-[16/10] overflow-hidden rounded-xl border border-white/5 bg-[#1f1f1f]">
            <img 
              src={car.image || defaultImage} 
              alt={car.name} 
              className="h-full w-full object-cover" 
            />
          </div>
          
          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/5 bg-[#1f1f1f] p-4 text-center">
              <p className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-1">Seats</p>
              <p className="text-base font-bold text-white">{car.seats || '5'} Kursi</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#1f1f1f] p-4 text-center">
              <p className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-1">Transmission</p>
              <p className="text-base font-bold text-white">{car.transmission || 'Automatic'}</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#1f1f1f] p-4 text-center">
              <p className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-1">Fuel</p>
              <p className="text-base font-bold text-white">{car.fuel || 'Bensin'}</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#1f1f1f] p-6 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#aaaaaa]">Deskripsi Kendaraan</h2>
            <p className="text-sm text-[#cccccc] leading-relaxed">
              {car.description || `Kendaraan ${car.name} tahun ${car.year} dari ${car.brand} menawarkan kenyamanan berkendara terbaik dengan performa optimal, efisiensi bahan bakar, serta fitur keselamatan terkini untuk perjalanan Anda.`}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Booking (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border border-white/5 bg-[#1f1f1f] p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{car.name}</h1>
                <p className="text-xs text-[#aaaaaa] mt-1">{car.brand} • Tahun {car.year}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                car.isAvailable ? 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20' : 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20'
              }`}>
                {car.isAvailable ? 'Tersedia' : 'Disewa'}
              </span>
            </div>
          </div>

          {/* Booking Card */}
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6 space-y-5">
            <div className="flex items-baseline justify-between border-b border-white/5 pb-4">
              <div>
                <p className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-1">Harga Sewa</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-white">
                    Rp {car.pricePerDay.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-[#aaaaaa]">/ hari</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-2 block">
                  Tanggal Mulai
                </label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#1f1f1f] border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-[#f3f4f6] focus:outline-none focus:border-[#474dec] focus:ring-2 focus:ring-[#474dec]/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-2 block">
                  Tanggal Selesai
                </label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#1f1f1f] border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-[#f3f4f6] focus:outline-none focus:border-[#474dec] focus:ring-2 focus:ring-[#474dec]/50 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-md px-3.5 py-2.5">
                {error}
              </div>
            )}

            {total > 0 && (
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider">Estimasi Total</span>
                <span className="text-xl font-bold text-white">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            )}

            <button 
              onClick={handleBooking}
              disabled={!car.isAvailable || isSubmitting}
              className="w-full rounded-md bg-[#474dec] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3a39e0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Memproses Reservasi...</span>
                </>
              ) : car.isAvailable ? (
                'Pesan Sekarang'
              ) : (
                'Mobil Sedang Disewa'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}