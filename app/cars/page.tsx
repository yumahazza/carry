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

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch('/api/cars');
        const data = await res.json();
        if (Array.isArray(data)) setCars(data);
      } catch (error) {
        console.error('Failed to fetch cars:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  // Fallback image kalau di database belum ada gambar
  const defaultImage = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-white">Our Fleet</h1>
        <p className="mt-2 text-lg text-[#aaaaaa]">Browse our selection of premium vehicles available for rent.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#474dec] border-t-transparent"></div>
        </div>
      ) : cars.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-24 text-center">
          <p className="text-xl font-medium text-white">No cars available yet.</p>
          <p className="mt-2 text-sm text-[#aaaaaa]">Check back later or contact admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <Link key={car.id} href={`/cars/${car.id}`} className="group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#1f1f1f] transition-all duration-300 hover:border-[#474dec]/30 hover:bg-[#242424]">
              <div className="aspect-[16/10] overflow-hidden bg-[#141414]">
                <img 
                  src={car.image || defaultImage} 
                  alt={car.name} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{car.name}</h3>
                    <p className="text-sm text-[#aaaaaa]">{car.brand} • {car.year}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    car.isAvailable ? 'bg-[#4ade80]/10 text-[#4ade80]' : 'bg-[#f87171]/10 text-[#f87171]'
                  }`}>
                    {car.isAvailable ? 'Available' : 'Rented'}
                  </span>
                </div>
                <div className="mt-auto flex items-end justify-between pt-6">
                  <div>
                    <p className="text-xs text-[#aaaaaa]">Starts from</p>
                    <p className="text-xl font-bold text-white">
                      Rp {car.pricePerDay.toLocaleString()}
                      <span className="text-sm font-normal text-[#aaaaaa]">/day</span>
                    </p>
                  </div>
                  <div className="rounded-md bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-[#474dec]">
                    View
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}