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
      <section className="border-b border-border-subtle px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex min-h-7 items-center gap-2 rounded-full border border-[rgba(71,77,236,0.30)] bg-[rgba(71,77,236,0.12)] px-3 py-1 text-xs font-semibold text-[#a5b4fc]">
            <span className="h-1.5 w-1.5 rounded-full bg-brand"></span>
            Next-Gen Fleet Experience
          </div>
          
          <h1 className="mb-6 text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-primary sm:text-5xl md:text-6xl">
            Find Your Next{' '}
            <span className="text-[#a5b4fc]">
              Ride
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-secondary sm:mb-10">
            Simple car rental for every journey. Choose from our curated selection of premium vehicles with transparent pricing.
          </p>

          <div className="mx-auto flex max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row">
            <Link
              href="/cars"
              className="btn-primary min-h-11 px-6"
            >
              Explore Fleet
            </Link>
            <Link
              href="/register"
              className="btn-secondary min-h-11 px-6"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Why book with Carry" className="border-b border-border-subtle">
        <div className="page-container flex flex-wrap justify-center gap-x-8 gap-y-3 py-5 text-sm text-secondary sm:justify-between">
          <span>Carefully maintained vehicles</span>
          <span>Clear daily pricing</span>
          <span>Simple booking management</span>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="border-b border-border-subtle px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="page-container">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Curated Fleet</p>
              <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-[28px]">Featured Cars</h2>
            </div>
            <Link href="/cars" className="inline-flex min-h-11 items-center font-medium text-[#a5b4fc] underline-offset-4 transition-colors hover:text-primary hover:underline">
              View All Fleet &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
                  <div className="skeleton aspect-[16/10] rounded-none" />
                  <div className="space-y-3 p-5">
                    <div className="skeleton h-5 w-3/5" />
                    <div className="skeleton h-4 w-2/5" />
                    <div className="skeleton mt-5 h-5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-default bg-surface/50 px-5 py-12 text-center">
              <h3 className="text-lg font-semibold text-primary">No cars available at the moment.</h3>
              <p className="mt-2 text-sm text-secondary">Please check back soon to explore our fleet.</p>
              <Link href="/cars" className="btn-secondary mt-5">View all vehicles</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
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
                        <span className="ml-1 text-sm text-muted">/ day</span>
                      </div>
                      <span className="text-sm font-medium text-[#a5b4fc] group-hover:underline group-hover:underline-offset-4">
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
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="page-container">
          <div className="mx-auto mb-10 max-w-xl text-center sm:mb-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">Our Advantage</p>
            <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Why Choose Carry?</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div className="surface-card p-5 sm:p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border-default bg-white/[0.04] text-primary">
                <svg aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24">
                  <path d="M3 10h18M7 15h.01M17 15h.01M5 18h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-primary">Curated Fleet</h3>
              <p className="text-sm leading-relaxed text-secondary">
                Every vehicle is thoroughly inspected, maintained, and cleaned for optimal comfort and safety.
              </p>
            </div>

            <div className="surface-card p-5 sm:p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border-default bg-white/[0.04] text-primary">
                <svg aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-primary">Transparent Pricing</h3>
              <p className="text-sm leading-relaxed text-secondary">
                Clear daily rates with no hidden surcharges or surprise fees during pickup or return.
              </p>
            </div>

            <div className="surface-card p-5 sm:p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border-default bg-white/[0.04] text-primary">
                <svg aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-primary">Instant Reservations</h3>
              <p className="text-sm leading-relaxed text-secondary">
                Seamless booking experience with quick confirmations and real-time trip tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div className="page-container flex flex-col items-start justify-between gap-6 rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8 md:flex-row md:items-center md:p-10">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-primary">Ready for your next journey?</h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary">Explore the fleet and find the right vehicle for your plans.</p>
          </div>
          <Link href="/cars" className="btn-primary w-full shrink-0 sm:w-auto">
            Explore Fleet
          </Link>
        </div>
      </section>
    </div>
  );
}