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

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch('/api/cars');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCars(data.slice(0, 3)); // Ambil 3 mobil pertama
        }
      } catch (error) {
        console.error('Gagal fetch cars:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-36 pb-24 px-6 border-b border-white/5 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-[#aaaaaa] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#474dec]"></span>
            Next-Gen Fleet Experience
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            Find Your Next{' '}
            <span className="bg-gradient-to-r from-[#f3f4f6] via-[#ffffff] to-[#474dec] bg-clip-text text-transparent">
              Ride
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#aaaaaa] mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
            Simple car rental for every journey. Choose from our curated selection of premium vehicles with transparent pricing.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/cars"
              className="w-full sm:w-auto px-6 py-3 bg-[#474dec] text-white font-semibold text-sm rounded-md hover:bg-[#3a39e0] transition-colors text-center"
            >
              Explore Fleet
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 bg-white/5 text-[#f3f4f6] font-semibold text-sm rounded-md border border-white/10 hover:bg-white/10 transition-colors text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-1">Curated Fleet</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Featured Cars</h2>
            </div>
            <Link href="/cars" className="text-sm font-medium text-[#474dec] hover:text-[#3a39e0] transition-colors">
              View All Fleet &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#aaaaaa]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#474dec] border-t-transparent mb-4"></div>
              <p className="text-sm">Loading available vehicles...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-dashed border-white/10 text-[#aaaaaa]">
              <p className="text-sm">No cars available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
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
                          {car.isAvailable ? 'Available' : 'Rented'}
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
                        <span className="text-xs text-[#aaaaaa] ml-1">/ day</span>
                      </div>
                      <span className="text-xs font-medium text-[#474dec] group-hover:translate-x-0.5 transition-transform">
                        Details &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-2">Our Advantage</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">Why Choose Carry?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1f1f1f] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
                  <path d="M3 10h18M7 15h.01M17 15h.01M5 18h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Curated Fleet</h3>
              <p className="text-sm text-[#aaaaaa] leading-relaxed">
                Every vehicle is thoroughly inspected, maintained, and cleaned for optimal comfort and safety.
              </p>
            </div>

            <div className="bg-[#1f1f1f] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Transparent Pricing</h3>
              <p className="text-sm text-[#aaaaaa] leading-relaxed">
                Clear daily rates with no hidden surcharges or surprise fees during pickup or return.
              </p>
            </div>

            <div className="bg-[#1f1f1f] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Instant Reservations</h3>
              <p className="text-sm text-[#aaaaaa] leading-relaxed">
                Seamless booking experience with quick confirmations and real-time trip tracking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}