'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import CarCard, { type CarSummary } from '@/components/CarCard';

type AvailabilityFilter = 'all' | 'available' | 'rented';
type SortOption = 'newest' | 'price_asc' | 'price_desc';

export default function CarsPage() {
  const [cars, setCars] = useState<CarSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const [reloadTick, setReloadTick] = useState(0);

  const handleReload = useCallback(() => {
    setLoading(true);
    setError('');
    setReloadTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/cars');
        if (!res.ok) {
          throw new Error('Gagal memuat daftar armada.');
        }
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setCars(data);
        }
      } catch {
        if (!cancelled) {
          setError('Gagal memuat daftar armada. Periksa koneksi jaringan Anda lalu coba lagi.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const brands = useMemo(() => {
    const unique = Array.from(new Set(cars.map((c) => c.brand.trim()).filter(Boolean)));
    return unique.sort((a, b) => a.localeCompare(b, 'id'));
  }, [cars]);

  const filteredCars = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const result = cars.filter((car) => {
      if (availability === 'available' && !car.isAvailable) return false;
      if (availability === 'rented' && car.isAvailable) return false;
      if (brandFilter !== 'all' && car.brand.toLowerCase() !== brandFilter.toLowerCase()) {
        return false;
      }
      if (keyword) {
        const matchName = car.name.toLowerCase().includes(keyword);
        const matchBrand = car.brand.toLowerCase().includes(keyword);
        if (!matchName && !matchBrand) return false;
      }
      return true;
    });

    if (sortBy === 'price_asc') {
      return [...result].sort((a, b) => a.pricePerDay - b.pricePerDay);
    }
    if (sortBy === 'price_desc') {
      return [...result].sort((a, b) => b.pricePerDay - a.pricePerDay);
    }
    return result;
  }, [cars, search, availability, brandFilter, sortBy]);

  const hasActiveFilter =
    search.trim() !== '' ||
    availability !== 'all' ||
    brandFilter !== 'all' ||
    sortBy !== 'newest';

  const resetFilters = () => {
    setSearch('');
    setAvailability('all');
    setBrandFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="pb-14 pt-8 sm:pb-20 sm:pt-10">
      {/* Page Header (DSG §17.1) */}
      <div className="page-container pb-6">
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-primary sm:text-4xl">
          Daftar Mobil
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-secondary">
          Bandingkan ketersediaan, spesifikasi kabin, dan tarif sewa harian untuk menentukan unit yang paling sesuai.
        </p>
        {!loading && !error && (
          <p aria-live="polite" className="mt-2 text-sm text-muted">
            Menampilkan <span className="tabular-nums font-semibold text-primary">{filteredCars.length}</span>{' '}
            dari <span className="tabular-nums">{cars.length}</span> mobil
          </p>
        )}
      </div>

      {/* Filter Toolbar (DSG §17.2: sticky di desktop, normal flow di mobile agar tidak memakan layar) */}
      <div className="border-y border-border-subtle bg-[color-mix(in_srgb,var(--canvas)_92%,transparent)] py-3 lg:sticky lg:top-16 lg:z-20 lg:backdrop-blur-md">
        <div className="page-container flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          {/* Search Input */}
          <div className="relative min-w-0 flex-1 lg:min-w-[240px]">
            <label htmlFor="car-search-input" className="sr-only">
              Cari nama atau merek mobil
            </label>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
            </svg>
            <input
              id="car-search-input"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau merek mobil..."
              className="field-control pl-10"
            />
          </div>

          {/* Segmented Availability Control (DSG §11.9) */}
          <div
            role="group"
            aria-label="Filter status ketersediaan"
            className="inline-flex flex-wrap items-center gap-1 rounded-[10px] border border-border-control bg-surface p-1"
          >
            {(
              [
                { id: 'all', label: 'Semua' },
                { id: 'available', label: 'Available' },
                { id: 'rented', label: 'Rented' },
              ] as const
            ).map((tab) => {
              const active = availability === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAvailability(tab.id)}
                  aria-pressed={active}
                  className={`min-h-9 flex-1 rounded-lg px-3 text-[13px] transition-colors sm:flex-none ${
                    active
                      ? 'bg-brand-soft font-semibold text-text-brand'
                      : 'font-medium text-secondary hover:text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Selects Row */}
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center">
            <div>
              <label htmlFor="car-brand-select" className="sr-only">
                Filter berdasarkan merek
              </label>
              <select
                id="car-brand-select"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="field-control py-2 text-sm sm:w-44"
              >
                <option value="all">Semua Merek</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="car-sort-select" className="sr-only">
                Urutkan daftar mobil
              </label>
              <select
                id="car-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="field-control py-2 text-sm sm:w-44"
              >
                <option value="newest">Terbaru</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
              </select>
            </div>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="btn-ghost btn-sm self-start lg:self-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Results Grid (DSG §17.3 - §17.7) */}
      <div className="page-container pt-6">
        {loading ? (
          <div
            aria-label="Memuat daftar mobil"
            aria-live="polite"
            aria-busy="true"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }, (_, idx) => (
              <div key={idx} className="surface-card overflow-hidden p-0">
                <div className="skeleton aspect-[16/10] rounded-none" />
                <div className="space-y-3 p-5">
                  <div className="skeleton h-5 w-3/5" />
                  <div className="skeleton h-4 w-2/5" />
                  <div className="skeleton mt-4 h-6 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="alert-box alert-danger flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">Gagal memuat daftar armada.</p>
              <p className="mt-0.5 text-sm text-secondary">{error}</p>
            </div>
            <button type="button" onClick={handleReload} className="btn-secondary shrink-0">
              Coba Lagi
            </button>
          </div>
        ) : cars.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-control bg-surface px-6 py-14 text-center sm:py-16">
            <h2 className="font-display text-lg font-semibold text-primary">
              Belum ada armada yang terdaftar
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-secondary">
              Unit mobil akan tampil di katalog ini segera setelah ditambahkan oleh tim operasional.
            </p>
            <button type="button" onClick={handleReload} className="btn-secondary mt-5">
              Muat Ulang Data
            </button>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-control bg-surface px-6 py-14 text-center sm:py-16">
            <h2 className="font-display text-lg font-semibold text-primary">
              Tidak ada mobil yang cocok
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-secondary">
              Coba ubah kata kunci pencarian, merek, atau filter ketersediaan untuk melihat armada lainnya.
            </p>
            <button type="button" onClick={resetFilters} className="btn-secondary mt-5">
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCars.map((car, index) => (
              <CarCard key={car.id} car={car} priority={index < 3} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
