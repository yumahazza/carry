'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CarAvailabilityBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/ToastProvider';
import { formatRupiah } from '@/lib/format';

export interface CarFormValues {
  name: string;
  brand: string;
  year: string;
  pricePerDay: string;
  isAvailable: boolean;
  seats: string;
  transmission: string;
  fuel: string;
  image: string;
  description: string;
}

interface AdminCarFormProps {
  mode: 'create' | 'edit';
  carId?: string;
}

const DEFAULT_VALUES: CarFormValues = {
  name: '',
  brand: '',
  year: String(new Date().getFullYear()),
  pricePerDay: '',
  isAvailable: true,
  seats: '5',
  transmission: 'Automatic',
  fuel: 'Bensin',
  image: '',
  description: '',
};

export default function AdminCarForm({ mode, carId }: AdminCarFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [values, setValues] = useState<CarFormValues>(DEFAULT_VALUES);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewImgError, setPreviewImgError] = useState(false);

  useEffect(() => {
    if (mode !== 'edit' || !carId) return;

    let cancelled = false;
    const fetchCar = async () => {
      setInitialLoading(true);
      setLoadError('');
      try {
        const res = await fetch(`/api/cars/${carId}`);
        if (!res.ok) {
          throw new Error('Data mobil tidak ditemukan.');
        }
        const data = await res.json();
        if (!cancelled) {
          setValues({
            name: data.name || '',
            brand: data.brand || '',
            year: String(data.year || new Date().getFullYear()),
            pricePerDay: String(data.pricePerDay || ''),
            isAvailable: Boolean(data.isAvailable),
            seats: data.seats ? String(data.seats) : '',
            transmission: data.transmission || '',
            fuel: data.fuel || '',
            image: data.image || '',
            description: data.description || '',
          });
        }
      } catch {
        if (!cancelled) {
          setLoadError('Data kendaraan tidak ditemukan atau gagal dimuat.');
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };

    fetchCar();
    return () => {
      cancelled = true;
    };
  }, [mode, carId]);

  const maxYear = new Date().getFullYear() + 1;

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!values.name.trim()) {
      nextErrors.name = 'Nama mobil wajib diisi.';
    }
    if (!values.brand.trim()) {
      nextErrors.brand = 'Merek mobil wajib diisi.';
    }
    const yearNum = Number(values.year);
    if (!Number.isInteger(yearNum) || yearNum < 1990 || yearNum > maxYear) {
      nextErrors.year = `Tahun produksi harus berupa angka antara 1990 dan ${maxYear}.`;
    }
    const priceNum = Number(values.pricePerDay);
    if (!Number.isInteger(priceNum) || priceNum <= 0) {
      nextErrors.pricePerDay = 'Tarif sewa per hari harus lebih besar dari Rp 0.';
    }
    if (values.seats.trim() !== '') {
      const seatsNum = Number(values.seats);
      if (!Number.isInteger(seatsNum) || seatsNum < 1 || seatsNum > 20) {
        nextErrors.seats = 'Jumlah kursi harus antara 1 sampai 20.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: values.name.trim(),
        brand: values.brand.trim(),
        year: Number(values.year),
        pricePerDay: Number(values.pricePerDay),
        isAvailable: values.isAvailable,
        seats: values.seats.trim() === '' ? null : Number(values.seats),
        transmission: values.transmission.trim() || null,
        fuel: values.fuel.trim() || null,
        image: values.image.trim() || null,
        description: values.description.trim() || null,
      };

      const url = mode === 'create' ? '/api/admin/cars' : `/api/admin/cars/${carId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Gagal menyimpan data kendaraan.');
        return;
      }

      showToast({
        title:
          mode === 'create'
            ? 'Unit mobil berhasil ditambahkan.'
            : 'Perubahan data mobil disimpan.',
        description: `${payload.brand} ${payload.name} telah diperbarui di katalog.`,
        variant: 'success',
      });
      router.push('/admin/cars');
    } catch {
      setFormError('Gagal menghubungi server. Periksa koneksi jaringan Anda.');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div aria-label="Memuat formulir mobil" className="space-y-5">
        <div className="skeleton h-10 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="skeleton h-[520px] rounded-2xl lg:col-span-8" />
          <div className="skeleton h-80 rounded-2xl lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="alert-box alert-danger flex-col sm:flex-row sm:items-center sm:justify-between">
        <span>{loadError}</span>
        <Link href="/admin/cars" className="btn-secondary shrink-0">
          Kembali ke Manajemen Mobil
        </Link>
      </div>
    );
  }

  const parsedPreviewPrice = Number(values.pricePerDay) > 0 ? Number(values.pricePerDay) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <nav aria-label="Breadcrumb form mobil" className="mb-1.5 flex items-center gap-2 text-xs text-muted">
            <Link href="/admin/cars" className="hover:text-primary hover:underline">
              Manajemen Mobil
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-secondary">
              {mode === 'create' ? 'Tambah Baru' : 'Edit Unit'}
            </span>
          </nav>
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-primary sm:text-3xl">
            {mode === 'create' ? 'Tambah Mobil Baru' : `Edit ${values.name || 'Mobil'}`}
          </h1>
        </div>

        <Link href="/admin/cars" className="btn-secondary self-start sm:self-auto">
          Batal
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Form Area */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="surface-card space-y-5 rounded-2xl p-5 sm:p-6 lg:col-span-8"
        >
          {formError && (
            <div role="alert" className="alert-box alert-danger">
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="car-name" className="field-label">
                Nama Mobil *
              </label>
              <input
                id="car-name"
                type="text"
                value={values.name}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                aria-invalid={Boolean(errors.name)}
                placeholder="Contoh: Innova Zenix Hybrid"
                className="field-control"
              />
              {errors.name && (
                <p role="alert" className="mt-1.5 text-[13px] text-danger">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="car-brand" className="field-label">
                Merek *
              </label>
              <input
                id="car-brand"
                type="text"
                value={values.brand}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, brand: e.target.value }));
                  if (errors.brand) setErrors((prev) => ({ ...prev, brand: '' }));
                }}
                aria-invalid={Boolean(errors.brand)}
                placeholder="Contoh: Toyota"
                className="field-control"
              />
              {errors.brand && (
                <p role="alert" className="mt-1.5 text-[13px] text-danger">
                  {errors.brand}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="car-year" className="field-label">
                Tahun Produksi *
              </label>
              <input
                id="car-year"
                type="number"
                min={1990}
                max={maxYear}
                value={values.year}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, year: e.target.value }));
                  if (errors.year) setErrors((prev) => ({ ...prev, year: '' }));
                }}
                aria-invalid={Boolean(errors.year)}
                className="field-control tabular-nums"
              />
              {errors.year && (
                <p role="alert" className="mt-1.5 text-[13px] text-danger">
                  {errors.year}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="car-price" className="field-label">
                Tarif Sewa per Hari (Rp) *
              </label>
              <input
                id="car-price"
                type="number"
                min={1}
                step={1000}
                value={values.pricePerDay}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, pricePerDay: e.target.value }));
                  if (errors.pricePerDay) setErrors((prev) => ({ ...prev, pricePerDay: '' }));
                }}
                aria-invalid={Boolean(errors.pricePerDay)}
                placeholder="Contoh: 550000"
                className="field-control tabular-nums"
              />
              {errors.pricePerDay && (
                <p role="alert" className="mt-1.5 text-[13px] text-danger">
                  {errors.pricePerDay}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="car-seats" className="field-label">
                Jumlah Kursi
              </label>
              <input
                id="car-seats"
                type="number"
                min={1}
                max={20}
                value={values.seats}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, seats: e.target.value }));
                  if (errors.seats) setErrors((prev) => ({ ...prev, seats: '' }));
                }}
                aria-invalid={Boolean(errors.seats)}
                placeholder="Contoh: 7"
                className="field-control tabular-nums"
              />
              {errors.seats && (
                <p role="alert" className="mt-1.5 text-[13px] text-danger">
                  {errors.seats}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="car-transmission" className="field-label">
                Transmisi
              </label>
              <select
                id="car-transmission"
                value={values.transmission}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, transmission: e.target.value }))
                }
                className="field-control"
              >
                <option value="">Pilih transmisi</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="CVT">CVT</option>
              </select>
            </div>

            <div>
              <label htmlFor="car-fuel" className="field-label">
                Bahan Bakar
              </label>
              <select
                id="car-fuel"
                value={values.fuel}
                onChange={(e) => setValues((prev) => ({ ...prev, fuel: e.target.value }))}
                className="field-control"
              >
                <option value="">Pilih bahan bakar</option>
                <option value="Bensin">Bensin</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Listrik">Listrik</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="car-image" className="field-label">
              URL Gambar Kendaraan (Opsional)
            </label>
            <input
              id="car-image"
              type="url"
              value={values.image}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, image: e.target.value }));
                setPreviewImgError(false);
              }}
              placeholder="https://..."
              className="field-control"
            />
            <p className="mt-1.5 text-xs text-muted">
              Kosongkan bila belum ada foto; kartu akan menampilkan siluet kendaraan standar secara rapi.
            </p>
          </div>

          <div>
            <label htmlFor="car-description" className="field-label">
              Deskripsi Kendaraan (Opsional)
            </label>
            <textarea
              id="car-description"
              rows={4}
              value={values.description}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Jelaskan kondisi kabin, peruntukan perjalanan, atau catatan penting unit ini..."
              className="field-control min-h-[112px] resize-y"
            />
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-raised p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={values.isAvailable}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, isAvailable: e.target.checked }))
                }
                className="mt-1 h-[18px] w-[18px] accent-[var(--brand)]"
              />
              <span>
                <span className="block text-sm font-semibold text-primary">
                  Tersedia untuk disewa (Available)
                </span>
                <span className="block text-xs text-secondary">
                  Jika tidak dicentang, unit akan ditandai sebagai Rented dan tidak bisa dipesan pelanggan.
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:justify-end">
            <Link href="/admin/cars" className="btn-secondary w-full sm:w-auto">
              Batal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full sm:w-auto"
            >
              {saving
                ? 'Menyimpan...'
                : mode === 'create'
                  ? 'Simpan Mobil Baru'
                  : 'Simpan Perubahan'}
            </button>
          </div>
        </form>

        {/* Live Card Preview */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              Pratinjau Kartu Katalog
            </p>
            <div className="surface-card overflow-hidden p-0">
              <div className="flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-border-subtle bg-surface-raised">
                {values.image.trim() && !previewImgError ? (
                  <img
                    src={values.image.trim()}
                    alt={values.name || 'Pratinjau kendaraan'}
                    width={640}
                    height={400}
                    onError={() => setPreviewImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center px-4 text-center text-muted">
                    <svg
                      aria-hidden="true"
                      className="h-11 w-11 stroke-current"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.6"
                    >
                      <path d="M5 17h14v-4l-2.2-5.5A1.5 1.5 0 0 0 15.4 6.5H8.6a1.5 1.5 0 0 0-1.4.95L5 13v4z" />
                      <circle cx="7.5" cy="17.5" r="1.75" />
                      <circle cx="16.5" cy="17.5" r="1.75" />
                    </svg>
                    <span className="mt-2 text-xs text-secondary">
                      {previewImgError ? 'URL gambar tidak dapat dimuat' : 'Pratinjau tanpa foto'}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="truncate font-display text-lg font-semibold text-primary">
                    {values.name.trim() || 'Nama Mobil'}
                  </h2>
                  <CarAvailabilityBadge isAvailable={values.isAvailable} />
                </div>
                <p className="mt-1 text-sm text-secondary">
                  {values.brand.trim() || 'Merek'} &bull; {values.year || 'Tahun'}
                </p>
                <div className="mt-4 border-t border-border-subtle pt-4">
                  <span className="tabular-nums font-display text-xl font-bold text-primary">
                    {formatRupiah(parsedPreviewPrice)}
                  </span>
                  <span className="ml-1 text-xs text-muted">/ hari</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

