'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Car {
  id: string;
  name: string;
  brand: string;
  year: number;
  pricePerDay: number;
  isAvailable: boolean;
  image?: string;
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch('/api/cars');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCars(data);
        }
      } catch (error) {
        console.error('Gagal fetch cars:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const filteredCars = cars.filter((car) => {
    if (filter === 'available') return car.isAvailable;
    if (filter === 'unavailable') return !car.isAvailable;
    return true;
  });

  return (
    <div className="pb-12 pt-10 sm:pb-16 sm:pt-12">
      <div className="page-container">
        {/* Header */}
        <div className="mb-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Fleet Directory</p>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">Daftar Mobil</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-secondary sm:text-base">Pilih armada berkualitas untuk perjalanan bisnis maupun liburan Anda.</p>
        </div>

        {/* Filter */}
        <div role="group" aria-label="Filter ketersediaan armada" className="mb-7 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
            className={`min-h-11 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none ${
              filter === 'all'
                ? 'border border-[rgba(71,77,236,0.30)] bg-[rgba(71,77,236,0.12)] text-[#a5b4fc]'
                : 'border border-border-default bg-white/[0.04] text-secondary hover:border-border-strong hover:bg-white/[0.08] hover:text-primary'
            }`}
          >
            Semua ({cars.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            aria-pressed={filter === 'available'}
            className={`min-h-11 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none ${
              filter === 'available'
                ? 'border border-[rgba(52,211,153,0.28)] bg-[rgba(52,211,153,0.12)] text-success'
                : 'border border-border-default bg-white/[0.04] text-secondary hover:border-border-strong hover:bg-white/[0.08] hover:text-primary'
            }`}
          >
            Tersedia ({cars.filter((c) => c.isAvailable).length})
          </button>
          <button
            onClick={() => setFilter('unavailable')}
            aria-pressed={filter === 'unavailable'}
            className={`min-h-11 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none ${
              filter === 'unavailable'
                ? 'border border-[rgba(251,113,133,0.28)] bg-[rgba(251,113,133,0.12)] text-danger'
                : 'border border-border-default bg-white/[0.04] text-secondary hover:border-border-strong hover:bg-white/[0.08] hover:text-primary'
            }`}
          >
            Tidak Tersedia ({cars.filter((c) => !c.isAvailable).length})
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div aria-label="Memuat daftar armada" aria-live="polite" aria-busy="true" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
                <div className="skeleton aspect-[16/10] rounded-none" />
                <div className="space-y-3 p-5">
                  <div className="skeleton h-5 w-3/5" />
                  <div className="skeleton h-4 w-2/5" />
                  <div className="skeleton mt-5 h-5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-default bg-surface/50 px-5 py-14 text-center">
            <h2 className="text-lg font-semibold text-primary">Tidak ada mobil yang cocok dengan filter ini.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-secondary">Coba ubah pilihan ketersediaan untuk melihat armada lainnya.</p>
            <button
              onClick={() => setFilter('all')}
              className="btn-secondary mt-5"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCars.map((car) => (
              <Link
                key={car.id}
                href={`/cars/${car.id}`}
                className="interactive-card group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface focus-visible:outline-none"
              >
                <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-surface-raised">
                  {car.image ? (
                    <img
                      src={car.image}
                      alt={car.name}
                      className="h-full w-full object-cover transition-transform duration-[260ms] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted">
                      <svg aria-hidden="true" className="h-12 w-12 fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24">
                        <path d="M5 17h14v-4l-2-6H7L5 13v4zM5 17a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm14 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 13h10" />
                      </svg>
                      <span className="mt-2 text-xs uppercase tracking-wider">No Image</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <h3 className="truncate text-lg font-semibold tracking-tight text-primary">
                        {car.name}
                      </h3>
                      <span
                        className={`status-badge shrink-0 ${
                          car.isAvailable
                            ? 'status-success'
                            : 'status-danger'
                        }`}
                      >
                        {car.isAvailable ? 'Available' : 'Rented'}
                      </span>
                    </div>
                    <p className="text-sm text-secondary">
                      {car.brand} • {car.year}
                    </p>
                  </div>

                  <div className="mt-5 flex items-baseline justify-between border-t border-border-subtle pt-4">
                    <div>
                      <span className="tabular-nums text-xl font-bold text-primary">
                        Rp {car.pricePerDay.toLocaleString('id-ID')}
                      </span>
                      <span className="ml-1 text-sm text-muted">/hari</span>
                    </div>
                    <span className="text-sm font-medium text-[#a5b4fc] group-hover:underline group-hover:underline-offset-4">
                      Detail &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}