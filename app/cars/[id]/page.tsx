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
      <div aria-label="Memuat detail mobil" aria-live="polite" className="page-container py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="skeleton aspect-[16/10] rounded-2xl lg:col-span-7" />
          <div className="space-y-4 lg:col-span-5">
            <div className="skeleton h-28 rounded-xl" />
            <div className="skeleton h-72 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="page-container py-16 text-center sm:py-24">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-primary">Mobil Tidak Ditemukan</h1>
        <p className="mb-6 text-sm text-secondary">Armada yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link
          href="/cars"
          className="btn-primary"
        >
          &larr; Kembali ke Daftar Mobil
        </Link>
      </div>
    );
  }

  const total = calculateTotal();
  const defaultImage = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="page-container-wide py-8 sm:py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex min-w-0 items-center gap-2 text-sm text-muted">
        <Link href="/cars" className="min-h-10 inline-flex items-center text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4">Fleet</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="truncate font-medium text-primary">{car.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* LEFT COLUMN: Image & Specs (7 cols) */}
        <div className="space-y-5 lg:col-span-7">
          <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised">
            <img 
              src={car.image || defaultImage} 
              alt={car.name} 
              className="h-full w-full object-cover" 
            />
          </div>
          
          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="surface-card p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted">Seats</p>
              <p className="text-sm font-semibold text-primary">{car.seats || '5'} Kursi</p>
            </div>
            <div className="surface-card p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted">Transmission</p>
              <p className="text-sm font-semibold text-primary">{car.transmission || 'Automatic'}</p>
            </div>
            <div className="surface-card p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted">Fuel</p>
              <p className="text-sm font-semibold text-primary">{car.fuel || 'Bensin'}</p>
            </div>
          </div>

          <div className="surface-card space-y-3 p-5 sm:p-6">
            <h2 className="text-base font-semibold text-primary">Deskripsi Kendaraan</h2>
            <p className="max-w-[65ch] text-sm leading-relaxed text-secondary">
              {car.description || `Kendaraan ${car.name} tahun ${car.year} dari ${car.brand} menawarkan kenyamanan berkendara terbaik dengan performa optimal, efisiensi bahan bakar, serta fitur keselamatan terkini untuk perjalanan Anda.`}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Booking (5 cols) */}
        <div className="space-y-5 lg:col-span-5">
          <div className="surface-card p-5 sm:p-6">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">{car.name}</h1>
                <p className="mt-1 text-sm text-secondary">{car.brand} • Tahun {car.year}</p>
              </div>
              <span className={`status-badge ${
                car.isAvailable ? 'status-success' : 'status-danger'
              }`}>
                {car.isAvailable ? 'Available' : 'Rented'}
              </span>
            </div>
          </div>

          {/* Booking Card */}
          <div className="space-y-5 rounded-2xl border border-border-default bg-surface-raised p-5 sm:p-6 lg:sticky lg:top-24">
            <div className="flex items-baseline justify-between border-b border-border-subtle pb-4">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Harga Sewa</p>
                <div className="flex items-baseline gap-1">
                  <span className="tabular-nums text-2xl font-bold tracking-tight text-primary">
                    Rp {car.pricePerDay.toLocaleString('id-ID')}
                  </span>
                  <span className="text-sm text-muted">/ hari</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="start-date" className="field-label">
                  Tanggal Mulai
                </label>
                <input 
                  id="start-date"
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="field-control"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="field-label">
                  Tanggal Selesai
                </label>
                <input 
                  id="end-date"
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="field-control"
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-xl border border-[rgba(251,113,133,0.28)] bg-[rgba(251,113,133,0.12)] px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            {total > 0 && (
              <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                <span className="text-sm font-medium text-secondary">Estimasi Total</span>
                <span className="tabular-nums text-lg font-bold text-primary">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            )}

            <button 
              onClick={handleBooking}
              disabled={!car.isAvailable || isSubmitting}
              className="btn-primary w-full"
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