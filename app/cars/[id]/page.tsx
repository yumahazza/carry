'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CarCard, { type CarSummary } from '@/components/CarCard';
import { CarAvailabilityBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/ToastProvider';
import {
  countRentalDays,
  formatDateRangeID,
  formatRupiah,
  getTodayInputDate,
} from '@/lib/format';

interface CarDetail extends CarSummary {
  description?: string | null;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params.id as string;

  const [car, setCar] = useState<CarDetail | null>(null);
  const [relatedCars, setRelatedCars] = useState<CarSummary[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [imgFailed, setImgFailed] = useState(false);

  // Booking form states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile sticky bar visibility
  const bookingPanelRef = useRef<HTMLDivElement>(null);
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const [showMobileBar, setShowMobileBar] = useState(true);

  const [reloadTick, setReloadTick] = useState(0);

  const handleReload = useCallback(() => {
    setLoading(true);
    setFetchError('');
    setNotFound(false);
    setReloadTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [carRes, userRes, listRes] = await Promise.all([
          fetch(`/api/cars/${id}`),
          fetch('/api/auth/me', { credentials: 'include' }).catch(() => null),
          fetch('/api/cars').catch(() => null),
        ]);

        if (carRes.status === 404) {
          if (!cancelled) {
            setNotFound(true);
            setCar(null);
          }
          return;
        }

        if (!carRes.ok) {
          throw new Error('Gagal memuat detail kendaraan.');
        }

        const carData: CarDetail = await carRes.json();
        if (!cancelled) {
          setCar(carData);
          setImgFailed(false);
        }

        if (!cancelled && userRes && userRes.ok) {
          const userData = await userRes.json();
          if (userData?.user) {
            setUser(userData.user);
            setCustomerName(userData.user.name || '');
            setCustomerEmail(userData.user.email || '');
            setCustomerPhone(userData.user.phone || '');
          }
        }

        if (!cancelled && listRes && listRes.ok) {
          const allCars = await listRes.json();
          if (Array.isArray(allCars)) {
            setRelatedCars(allCars.filter((item: CarSummary) => item.id !== id).slice(0, 3));
          }
        }
      } catch {
        if (!cancelled) {
          setFetchError('Gagal memuat detail kendaraan. Silakan muat ulang halaman.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, reloadTick]);

  useEffect(() => {
    const panel = bookingPanelRef.current;
    if (!panel || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setShowMobileBar(!entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(panel);
    return () => observer.disconnect();
  }, [car]);

  const todayStr = getTodayInputDate();
  const rentalDays = countRentalDays(startDate, endDate);
  const estimatedTotal = car && rentalDays > 0 ? rentalDays * car.pricePerDay : 0;

  const validateBookingForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!startDate) {
      nextErrors.startDate = 'Pilih tanggal mulai sewa.';
    } else if (startDate < todayStr) {
      nextErrors.startDate = 'Tanggal mulai tidak boleh sebelum hari ini.';
    }

    if (!endDate) {
      nextErrors.endDate = 'Pilih tanggal selesai sewa.';
    } else if (startDate && endDate <= startDate) {
      nextErrors.endDate = 'Tanggal selesai harus setelah tanggal mulai.';
    }

    if (!customerName.trim()) {
      nextErrors.customerName = 'Nama lengkap penyewa wajib diisi.';
    }

    if (!customerPhone.trim()) {
      nextErrors.customerPhone = 'Nomor telepon aktif wajib diisi.';
    }

    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      nextErrors.customerEmail = 'Masukkan alamat email yang valid.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!car || !car.isAvailable) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/cars/${id}`)}`);
      return;
    }

    if (!validateBookingForm()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          carId: car.id,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || user.email,
          startDate,
          endDate,
        }),
      });

      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(`/cars/${id}`)}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Gagal mengirim permintaan booking.');
        return;
      }

      showToast({
        title: 'Pesanan berhasil dikirim.',
        description: 'Menunggu persetujuan admin operasional.',
        variant: 'success',
      });
      router.push('/my-bookings?success=true');
    } catch {
      setSubmitError('Gagal terhubung ke server. Silakan coba beberapa saat lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        aria-label="Memuat detail kendaraan"
        aria-live="polite"
        className="page-container py-8 sm:py-12"
      >
        <div className="skeleton mb-6 h-5 w-48" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="skeleton aspect-[16/9] w-full rounded-2xl" />
            <div className="skeleton h-28 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="skeleton h-[460px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="page-container py-16">
        <div
          role="alert"
          className="alert-box alert-danger mx-auto max-w-xl flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold">Gagal memuat detail kendaraan</p>
            <p className="mt-0.5 text-sm text-secondary">{fetchError}</p>
          </div>
          <button type="button" onClick={handleReload} className="btn-secondary shrink-0">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (notFound || !car) {
    return (
      <div className="page-container py-16 text-center sm:py-24">
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border-control bg-surface p-8">
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-primary">
            Mobil Tidak Ditemukan
          </h1>
          <p className="mt-2 text-sm text-secondary">
            Unit kendaraan yang Anda cari tidak terdaftar atau telah dihapus dari katalog.
          </p>
          <Link href="/cars" className="btn-primary mt-6">
            Kembali ke Daftar Mobil
          </Link>
        </div>
      </div>
    );
  }

  const specs = [
    { label: 'Kapasitas', value: car.seats ? `${car.seats} Kursi` : 'Tidak dicantumkan' },
    { label: 'Transmisi', value: car.transmission || 'Tidak dicantumkan' },
    { label: 'Bahan Bakar', value: car.fuel || 'Tidak dicantumkan' },
    { label: 'Tahun Unit', value: String(car.year) },
  ];

  return (
    <div className="pb-28 pt-6 sm:pt-8 lg:pb-16">
      <div className="page-container">
        {/* Breadcrumb (DSG §18.1) */}
        <nav aria-label="Breadcrumb" className="mb-5 flex min-w-0 items-center gap-2 text-[13px] text-muted">
          <Link
            href="/cars"
            className="inline-flex min-h-9 items-center transition-colors hover:text-primary hover:underline hover:underline-offset-4"
          >
            Daftar Mobil
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="truncate font-medium text-primary">
            {car.name}
          </span>
        </nav>

        {/* Main 7/5 Grid (DSG §18.2) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Visual, Title, Description, Specs */}
          <div className="space-y-6 lg:col-span-7">
            <div className="flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised">
              {car.image && !imgFailed ? (
                <img
                  src={car.image}
                  alt={`${car.brand} ${car.name} tahun ${car.year}`}
                  width={960}
                  height={540}
                  fetchPriority="high"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center px-6 text-center text-muted">
                  <svg
                    aria-hidden="true"
                    className="h-16 w-16 stroke-current"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.5"
                  >
                    <path d="M5 17h14v-4l-2.2-5.5A1.5 1.5 0 0 0 15.4 6.5H8.6a1.5 1.5 0 0 0-1.4.95L5 13v4z" />
                    <circle cx="7.5" cy="17.5" r="1.75" />
                    <circle cx="16.5" cy="17.5" r="1.75" />
                    <path d="M5.5 13h13" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-secondary">
                    Foto belum tersedia untuk {car.brand} {car.name}
                  </p>
                </div>
              )}
            </div>

            {/* Car Summary (DSG §18.4) */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-primary sm:text-4xl">
                    {car.name}
                  </h1>
                  <p className="mt-1.5 text-sm text-secondary">
                    {car.brand} <span aria-hidden="true">&bull;</span> Tahun {car.year}
                  </p>
                </div>
                <CarAvailabilityBadge isAvailable={car.isAvailable} />
              </div>

              <p className="mt-4 max-w-[65ch] text-[15px] leading-[1.65] text-secondary">
                {car.description ||
                  `Unit ${car.brand} ${car.name} keluaran tahun ${car.year}. Periksa ketersediaan tanggal pada panel pemesanan untuk melihat estimasi total biaya sewa harian.`}
              </p>

              {/* Specs Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="surface-card p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                      {spec.label}
                    </p>
                    <p className="mt-1 text-[15px] font-semibold text-primary">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Panel (DSG §18.5) */}
          <div className="lg:col-span-5">
            <div
              id="booking-panel"
              ref={bookingPanelRef}
              className="rounded-2xl border border-border-default bg-surface-raised p-5 sm:p-6 lg:sticky lg:top-24"
            >
              <div className="border-b border-border-subtle pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                  Tarif Sewa Harian
                </p>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <div>
                    <span className="tabular-nums font-display text-[28px] font-bold tracking-[-0.02em] text-primary">
                      {formatRupiah(car.pricePerDay)}
                    </span>
                    <span className="ml-1.5 text-sm text-muted">/ hari</span>
                  </div>
                  <CarAvailabilityBadge isAvailable={car.isAvailable} />
                </div>
              </div>

              {!car.isAvailable && (
                <div role="status" className="alert-box alert-danger mt-4">
                  <span>
                    Unit ini sedang berstatus <strong>Rented</strong> dan tidak dapat dipesan sampai masa sewa berjalan selesai.
                  </span>
                </div>
              )}

              {car.isAvailable && !user && (
                <div role="note" className="alert-box alert-info mt-4">
                  <span className="text-secondary">
                    Pilih tanggal untuk menghitung estimasi biaya. Anda akan diminta{' '}
                    <Link
                      href={`/login?redirect=${encodeURIComponent(`/cars/${id}`)}`}
                      className="font-semibold text-text-brand underline underline-offset-4"
                    >
                      masuk ke akun
                    </Link>{' '}
                    saat mengirim pesanan.
                  </span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} noValidate className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="booking-start-date" className="field-label">
                      Tanggal Mulai
                    </label>
                    <input
                      ref={startDateInputRef}
                      id="booking-start-date"
                      type="date"
                      min={todayStr}
                      disabled={!car.isAvailable}
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (fieldErrors.startDate) {
                          setFieldErrors((prev) => ({ ...prev, startDate: '' }));
                        }
                      }}
                      aria-invalid={Boolean(fieldErrors.startDate)}
                      aria-describedby={fieldErrors.startDate ? 'err-start-date' : undefined}
                      className="field-control"
                    />
                    {fieldErrors.startDate && (
                      <p id="err-start-date" role="alert" className="mt-1.5 text-[13px] text-danger">
                        {fieldErrors.startDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="booking-end-date" className="field-label">
                      Tanggal Selesai
                    </label>
                    <input
                      id="booking-end-date"
                      type="date"
                      min={startDate || todayStr}
                      disabled={!car.isAvailable}
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        if (fieldErrors.endDate) {
                          setFieldErrors((prev) => ({ ...prev, endDate: '' }));
                        }
                      }}
                      aria-invalid={Boolean(fieldErrors.endDate)}
                      aria-describedby={fieldErrors.endDate ? 'err-end-date' : undefined}
                      className="field-control"
                    />
                    {fieldErrors.endDate && (
                      <p id="err-end-date" role="alert" className="mt-1.5 text-[13px] text-danger">
                        {fieldErrors.endDate}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="booking-customer-name" className="field-label">
                    Nama Penyewa
                  </label>
                  <input
                    id="booking-customer-name"
                    type="text"
                    disabled={!car.isAvailable}
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (fieldErrors.customerName) {
                        setFieldErrors((prev) => ({ ...prev, customerName: '' }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.customerName)}
                    aria-describedby={fieldErrors.customerName ? 'err-cust-name' : undefined}
                    placeholder="Nama lengkap sesuai identitas"
                    className="field-control"
                  />
                  {fieldErrors.customerName && (
                    <p id="err-cust-name" role="alert" className="mt-1.5 text-[13px] text-danger">
                      {fieldErrors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="booking-customer-phone" className="field-label">
                    Nomor Telepon
                  </label>
                  <input
                    id="booking-customer-phone"
                    type="tel"
                    disabled={!car.isAvailable}
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (fieldErrors.customerPhone) {
                        setFieldErrors((prev) => ({ ...prev, customerPhone: '' }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.customerPhone)}
                    aria-describedby={fieldErrors.customerPhone ? 'err-cust-phone' : undefined}
                    placeholder="Contoh: 081234567890"
                    className="field-control"
                  />
                  {fieldErrors.customerPhone && (
                    <p id="err-cust-phone" role="alert" className="mt-1.5 text-[13px] text-danger">
                      {fieldErrors.customerPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="booking-customer-email" className="field-label">
                    Email Konfirmasi
                  </label>
                  <input
                    id="booking-customer-email"
                    type="email"
                    disabled={!car.isAvailable}
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (fieldErrors.customerEmail) {
                        setFieldErrors((prev) => ({ ...prev, customerEmail: '' }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.customerEmail)}
                    aria-describedby={fieldErrors.customerEmail ? 'err-cust-email' : undefined}
                    placeholder="nama@email.com"
                    className="field-control"
                  />
                  {fieldErrors.customerEmail && (
                    <p id="err-cust-email" role="alert" className="mt-1.5 text-[13px] text-danger">
                      {fieldErrors.customerEmail}
                    </p>
                  )}
                </div>

                {submitError && (
                  <div role="alert" className="alert-box alert-danger">
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Price Summary (DSG §18.5) */}
                <div className="space-y-2 border-t border-border-subtle pt-4 text-sm">
                  {rentalDays > 0 ? (
                    <>
                      <div className="flex items-center justify-between text-secondary">
                        <span>Periode sewa</span>
                        <span className="font-medium text-primary">
                          {formatDateRangeID(startDate, endDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-secondary">
                        <span>
                          Durasi ({rentalDays} hari &times; {formatRupiah(car.pricePerDay)})
                        </span>
                        <span className="tabular-nums font-medium text-primary">
                          {formatRupiah(estimatedTotal)}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between border-t border-border-subtle pt-3">
                        <span className="text-[15px] font-semibold text-primary">Estimasi Total</span>
                        <span className="tabular-nums font-display text-xl font-bold text-primary">
                          {formatRupiah(estimatedTotal)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted">
                      Pilih tanggal mulai dan tanggal selesai untuk melihat rincian estimasi total biaya sewa.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!car.isAvailable || isSubmitting}
                  className="btn-primary btn-lg w-full"
                >
                  {isSubmitting ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                      />
                      <span>Memproses...</span>
                    </>
                  ) : !car.isAvailable ? (
                    'Sedang Disewa'
                  ) : user ? (
                    'Pesan Sekarang'
                  ) : (
                    'Masuk untuk Memesan'
                  )}
                </button>

                <p className="text-center text-xs text-muted">
                  Kendaraan dikunci untuk jadwal Anda setelah disetujui oleh admin.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Related Cars (DSG §18.9) */}
        {relatedCars.length > 0 && (
          <section className="mt-16 border-t border-border-subtle pt-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-primary">
                  Armada Lainnya
                </h2>
                <p className="mt-1 text-sm text-secondary">
                  Pilihan kendaraan lain yang tersedia di katalog Carry.
                </p>
              </div>
              <Link
                href="/cars"
                className="text-sm font-semibold text-text-brand underline-offset-4 hover:underline"
              >
                Semua Mobil
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCars.map((item) => (
                <CarCard key={item.id} car={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky Bottom Action Bar (DSG §18.6) */}
      {showMobileBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-default bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted">
                {estimatedTotal > 0 ? `Estimasi (${rentalDays} hari)` : 'Tarif per hari'}
              </p>
              <p className="truncate tabular-nums font-display text-lg font-bold text-primary">
                {formatRupiah(estimatedTotal > 0 ? estimatedTotal : car.pricePerDay)}
              </p>
            </div>
            <button
              type="button"
              disabled={!car.isAvailable}
              onClick={() => {
                bookingPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                startDateInputRef.current?.focus();
              }}
              className="btn-primary shrink-0"
            >
              {car.isAvailable ? 'Isi Jadwal Sewa' : 'Sedang Disewa'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
