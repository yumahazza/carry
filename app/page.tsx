'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import CarCard, { type CarSummary } from '@/components/CarCard';
import { CarAvailabilityBadge } from '@/components/ui/StatusBadge';
import { formatRupiah } from '@/lib/format';

interface SessionUser {
  id: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Pilih kendaraan yang berstatus Available',
    description:
      'Bandingkan kapasitas kursi, jenis transmisi, bahan bakar, serta tarif sewa harian langsung dari katalog armada.',
  },
  {
    step: '02',
    title: 'Tentukan tanggal mulai dan selesai sewa',
    description:
      'Kalkulator otomatis pada halaman kendaraan menghitung durasi hari dan estimasi biaya total dalam Rupiah sebelum pesanan dikirim.',
  },
  {
    step: '03',
    title: 'Tinjauan dan persetujuan oleh admin operasional',
    description:
      'Tim operasional memverifikasi jadwal pesanan Anda. Begitu disetujui menjadi Approved, unit langsung dikunci untuk jadwal Anda.',
  },
  {
    step: '04',
    title: 'Pantau status perjalanan hingga pengembalian',
    description:
      'Lacak status pesanan secara langsung dari halaman Pesanan Saya atau batalkan mandiri sebelum keberangkatan bila rencana berubah.',
  },
];

export default function HomePage() {
  const [cars, setCars] = useState<CarSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

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
        const [carsRes, meRes] = await Promise.all([
          fetch('/api/cars'),
          fetch('/api/auth/me', { credentials: 'include' }).catch(() => null),
        ]);

        if (!carsRes.ok) {
          throw new Error('Gagal memuat daftar armada.');
        }

        const carsData = await carsRes.json();
        if (!cancelled && Array.isArray(carsData)) {
          setCars(carsData);
          setHeroImgFailed(false);
        }

        if (!cancelled && meRes && meRes.ok) {
          const meData = await meRes.json();
          setUser(meData?.user ?? null);
        }
      } catch {
        if (!cancelled) {
          setError('Gagal memuat daftar armada. Silakan periksa koneksi lalu coba lagi.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const featuredShowcase =
    cars.find((item) => item.isAvailable && item.image) ||
    cars.find((item) => item.isAvailable) ||
    cars[0] ||
    null;

  const featuredFleet = cars.slice(0, 6);

  return (
    <div>
      {/* 1. Asymmetric 12-Col Hero (DSG §16.2 + antislop R-09/R-01/R-40) */}
      <section className="border-b border-border-subtle py-12 sm:py-16 lg:py-20">
        <div className="page-container">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <h1 className="max-w-[18ch] font-display text-[clamp(2.15rem,4.5vw,3.5rem)] font-bold leading-[1.06] tracking-[-0.03em] text-primary">
                Sewa Mobil Harian dengan Tarif Terbuka dan Unit Terawat.
              </h1>

              <p className="mt-5 max-w-[56ch] text-base leading-[1.65] text-secondary">
                Pilih kendaraan yang sesuai kebutuhan perjalanan bisnis maupun keluarga Anda, hitung estimasi biaya sewa per hari secara transparan, dan pantau konfirmasi pesanan langsung dari satu akun.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link href="/cars" className="btn-primary btn-lg w-full sm:w-auto">
                  Jelajahi Armada
                </Link>
                {user ? (
                  <Link href="/my-bookings" className="btn-secondary btn-lg w-full sm:w-auto">
                    Lihat Pesanan Saya
                  </Link>
                ) : (
                  <Link href="/register" className="btn-secondary btn-lg w-full sm:w-auto">
                    Buat Akun Baru
                  </Link>
                )}
              </div>

              {/* Trust Strip (DSG §16.2: klaim operasional faktual tanpa angka karangan R-17) */}
              <ul
                aria-label="Jaminan layanan Carry"
                className="mt-10 flex flex-col gap-3 border-t border-border-subtle pt-6 text-[13px] text-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-0"
              >
                <li className="sm:pr-5">Tarif harian jelas tanpa biaya tersembunyi</li>
                <li className="sm:border-l sm:border-border-subtle sm:px-5">
                  Status ketersediaan unit sinkron langsung
                </li>
                <li className="sm:border-l sm:border-border-subtle sm:pl-5">
                  Pembatalan mandiri sebelum keberangkatan
                </li>
              </ul>
            </div>

            {/* Right Column: Live Featured Vehicle Showcase (C-5 & R-40) */}
            <div className="lg:col-span-5">
              {loading ? (
                <div
                  aria-label="Memuat sorotan armada"
                  className="overflow-hidden rounded-2xl border border-border-default bg-surface p-4"
                >
                  <div className="skeleton aspect-[16/10] w-full rounded-xl" />
                  <div className="mt-4 space-y-3 px-1 pb-1">
                    <div className="skeleton h-5 w-2/3" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton mt-4 h-10 w-full rounded-lg" />
                  </div>
                </div>
              ) : featuredShowcase ? (
                <div className="overflow-hidden rounded-2xl border border-border-default bg-surface shadow-[var(--shadow-sm-val)]">
                  <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden border-b border-border-subtle bg-surface-raised">
                    {featuredShowcase.image && !heroImgFailed ? (
                      <img
                        src={featuredShowcase.image}
                        alt={`${featuredShowcase.brand} ${featuredShowcase.name} tahun ${featuredShowcase.year}`}
                        width={800}
                        height={500}
                        fetchPriority="high"
                        onError={() => setHeroImgFailed(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center px-6 text-center text-muted">
                        <svg
                          aria-hidden="true"
                          className="h-14 w-14 stroke-current"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="1.5"
                        >
                          <path d="M5 17h14v-4l-2.2-5.5A1.5 1.5 0 0 0 15.4 6.5H8.6a1.5 1.5 0 0 0-1.4.95L5 13v4z" />
                          <circle cx="7.5" cy="17.5" r="1.75" />
                          <circle cx="16.5" cy="17.5" r="1.75" />
                          <path d="M5.5 13h13" />
                        </svg>
                        <span className="mt-2 text-xs font-medium text-secondary">
                          {featuredShowcase.brand} {featuredShowcase.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                          Unit Siap Jalan
                        </p>
                        <h2 className="mt-1 truncate font-display text-xl font-bold tracking-[-0.02em] text-primary">
                          {featuredShowcase.name}
                        </h2>
                        <p className="mt-0.5 text-sm text-secondary">
                          {featuredShowcase.brand} &bull; Tahun {featuredShowcase.year}
                        </p>
                      </div>
                      <CarAvailabilityBadge isAvailable={featuredShowcase.isAvailable} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-secondary">
                      {featuredShowcase.seats && (
                        <span className="rounded-md border border-border-subtle bg-surface-raised px-2.5 py-1">
                          {featuredShowcase.seats} Kursi
                        </span>
                      )}
                      {featuredShowcase.transmission && (
                        <span className="rounded-md border border-border-subtle bg-surface-raised px-2.5 py-1">
                          {featuredShowcase.transmission}
                        </span>
                      )}
                      {featuredShowcase.fuel && (
                        <span className="rounded-md border border-border-subtle bg-surface-raised px-2.5 py-1">
                          {featuredShowcase.fuel}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-muted">Tarif sewa harian</p>
                        <p className="tabular-nums font-display text-2xl font-bold text-primary">
                          {formatRupiah(featuredShowcase.pricePerDay)}
                          <span className="ml-1 font-sans text-xs font-normal text-muted">/ hari</span>
                        </p>
                      </div>
                      <Link
                        href={`/cars/${featuredShowcase.id}`}
                        className="btn-primary w-full sm:w-auto"
                      >
                        Pesan Unit Ini
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border-control bg-surface p-8 text-center">
                  <p className="font-display text-base font-semibold text-primary">
                    Katalog Armada Sedang Disiapkan
                  </p>
                  <p className="mt-1.5 text-sm text-secondary">
                    {error
                      ? 'Data kendaraan belum dapat dimuat saat ini.'
                      : 'Admin belum menambahkan unit kendaraan ke katalog publik.'}
                  </p>
                  {error && (
                    <button type="button" onClick={handleReload} className="btn-secondary mt-4">
                      Coba Lagi
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Fleet Section (DSG §16.3) */}
      <section className="border-b border-border-subtle py-12 sm:py-16">
        <div className="page-container">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-primary sm:text-[28px]">
                Armada Pilihan
              </h2>
              <p className="mt-1.5 text-sm text-secondary">
                Daftar kendaraan terbaru beserta status ketersediaan dan tarif per hari.
              </p>
            </div>
            <Link
              href="/cars"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-text-brand underline-offset-4 hover:underline"
            >
              Lihat semua armada
            </Link>
          </div>

          {loading ? (
            <div
              aria-label="Memuat daftar armada pilihan"
              aria-live="polite"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="surface-card overflow-hidden p-0">
                  <div className="skeleton aspect-[16/10] rounded-none" />
                  <div className="space-y-3 p-5">
                    <div className="skeleton h-5 w-3/5" />
                    <div className="skeleton h-4 w-2/5" />
                    <div className="skeleton mt-4 h-6 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="alert-box alert-danger flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Gagal memuat daftar armada.</p>
                <p className="mt-0.5 text-sm text-secondary">{error}</p>
              </div>
              <button type="button" onClick={handleReload} className="btn-secondary shrink-0">
                Coba Lagi
              </button>
            </div>
          ) : featuredFleet.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-control bg-surface px-6 py-12 text-center sm:py-16">
              <h3 className="font-display text-lg font-semibold text-primary">
                Belum ada armada tersedia saat ini
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-secondary">
                Silakan buka halaman daftar mobil atau masuk sebagai admin untuk menambahkan unit kendaraan pertama.
              </p>
              <Link href="/cars" className="btn-secondary mt-5">
                Buka Katalog Mobil
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredFleet.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Asymmetric Editorial Rental Workflow (DSG §16.4 + antislop R-05 / RHYTHM 2) */}
      <section className="border-b border-border-subtle bg-surface py-12 sm:py-16">
        <div className="page-container">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-primary sm:text-[28px]">
                Alur Penyewaan yang Jelas Sejak Awal
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-secondary">
                Setiap perubahan status booking langsung menyinkronkan ketersediaan mobil sehingga jadwal sewa tidak saling bertumpuk.
              </p>
              <div className="mt-6">
                <Link href="/cars" className="btn-secondary">
                  Cek Ketersediaan Unit
                </Link>
              </div>
            </div>

            <ol className="divide-y divide-border-subtle border-y border-border-subtle lg:col-span-8">
              {WORKFLOW_STEPS.map((item) => (
                <li
                  key={item.step}
                  className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:gap-6 sm:py-6"
                >
                  <div className="sm:col-span-2">
                    <span className="font-mono text-xs font-semibold tracking-[0.08em] text-text-brand">
                      LANGKAH {item.step}
                    </span>
                  </div>
                  <div className="sm:col-span-10">
                    <h3 className="font-display text-lg font-semibold text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-secondary">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 4. Commercial CTA Band (DSG §16.5) */}
      <section className="py-12 sm:py-16">
        <div className="page-container">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-10 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-primary sm:text-[28px]">
                Siap menjadwalkan perjalanan Anda berikutnya?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Telusuri seluruh unit yang siap disewa hari ini atau masuk ke akun Anda untuk mengelola jadwal reservasi.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/cars" className="btn-primary w-full sm:w-auto">
                Jelajahi Armada
              </Link>
              {user ? (
                <Link href="/my-bookings" className="btn-ghost w-full sm:w-auto">
                  Pesanan Saya
                </Link>
              ) : (
                <Link href="/login" className="btn-ghost w-full sm:w-auto">
                  Masuk ke Akun
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
