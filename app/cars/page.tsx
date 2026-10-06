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
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-1">Fleet Directory</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">Daftar Mobil</h1>
          <p className="text-sm text-[#aaaaaa]">Pilih armada berkualitas untuk perjalanan bisnis maupun liburan Anda.</p>
        </div>

        {/* Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#474dec] text-white'
                : 'border border-white/10 bg-white/5 text-[#aaaaaa] hover:text-white hover:bg-white/10'
            }`}
          >
            Semua ({cars.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'available'
                ? 'bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30'
                : 'border border-white/10 bg-white/5 text-[#aaaaaa] hover:text-white hover:bg-white/10'
            }`}
          >
            Tersedia ({cars.filter((c) => c.isAvailable).length})
          </button>
          <button
            onClick={() => setFilter('unavailable')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'unavailable'
                ? 'bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30'
                : 'border border-white/10 bg-white/5 text-[#aaaaaa] hover:text-white hover:bg-white/10'
            }`}
          >
            Tidak Tersedia ({cars.filter((c) => !c.isAvailable).length})
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#aaaaaa]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#474dec] border-t-transparent mb-4"></div>
            <p className="text-sm">Memuat daftar armada...</p>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-white/10 bg-[#1f1f1f]/50">
            <p className="text-sm text-[#aaaaaa]">Tidak ada mobil yang sesuai dengan filter yang dipilih.</p>
            <button
              onClick={() => setFilter('all')}
              className="mt-4 text-xs font-medium text-[#474dec] hover:underline"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <Link
                key={car.id}
                href={`/cars/${car.id}`}
                className="group bg-[#1f1f1f] rounded-xl border border-white/5 overflow-hidden hover:border-[#474dec]/30 hover:bg-[#242424] transition-all duration-200 flex flex-col"
              >
                <div className="aspect-[16/10] bg-[#141414] relative overflow-hidden flex items-center justify-center">
                  {car.image ? (
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#666666]">
                      <svg className="w-12 h-12 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
                        <path d="M5 17h14v-4l-2-6H7L5 13v4zM5 17a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm14 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 13h10" />
                      </svg>
                      <span className="text-xs mt-2 uppercase tracking-wider">No Image</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-[#f3f4f6]">
                        {car.name}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                          car.isAvailable
                            ? 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20'
                            : 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20'
                        }`}
                      >
                        {car.isAvailable ? 'Tersedia' : 'Disewa'}
                      </span>
                    </div>
                    <p className="text-xs text-[#aaaaaa]">
                      {car.brand} • {car.year}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-baseline justify-between">
                    <div>
                      <span className="text-base font-bold text-white">
                        Rp {car.pricePerDay.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-[#aaaaaa] ml-1">/hari</span>
                    </div>
                    <span className="text-xs font-medium text-[#474dec] group-hover:translate-x-0.5 transition-transform">
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