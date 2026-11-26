'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import { CarAvailabilityBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/ToastProvider';
import { formatRupiah } from '@/lib/format';

interface AdminCarRow {
  id: string;
  name: string;
  brand: string;
  year: number;
  pricePerDay: number;
  isAvailable: boolean;
  image?: string | null;
  seats?: number | null;
  transmission?: string | null;
  fuel?: string | null;
}

function CarRowThumb({ image, alt }: { image?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!image || failed) {
    return (
      <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-raised text-muted">
        <svg aria-hidden="true" className="h-4 w-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
          <path d="M5 17h14v-4l-2-5H7l-2 5v4z" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={image}
      alt={alt}
      width={48}
      height={32}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-8 w-12 shrink-0 rounded-md border border-border-subtle object-cover"
    />
  );
}

export default function AdminCarsManagementPage() {
  const { showToast } = useToast();
  const [cars, setCars] = useState<AdminCarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'rented'>('all');

  const [deleteTarget, setDeleteTarget] = useState<AdminCarRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
        const res = await fetch('/api/admin/cars', { credentials: 'include' });
        if (!res.ok) throw new Error('Gagal memuat daftar armada.');
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setCars(data);
      } catch {
        if (!cancelled) {
          setError('Gagal memuat daftar armada. Pastikan sesi Admin Anda aktif.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const filteredCars = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cars.filter((car) => {
      if (statusFilter === 'available' && !car.isAvailable) return false;
      if (statusFilter === 'rented' && car.isAvailable) return false;
      if (q) {
        return (
          car.name.toLowerCase().includes(q) || car.brand.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [cars, search, statusFilter]);

  const handleToggleAvailability = async (car: AdminCarRow) => {
    setTogglingId(car.id);
    try {
      const res = await fetch(`/api/admin/cars/${car.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isAvailable: !car.isAvailable }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast({
          title: 'Gagal mengubah status unit',
          description: data.error || 'Perubahan ketersediaan ditolak.',
          variant: 'danger',
        });
        return;
      }

      setCars((prev) =>
        prev.map((item) =>
          item.id === car.id ? { ...item, isAvailable: !car.isAvailable } : item
        )
      );
      showToast({
        title: `Status ${car.name} diperbarui`,
        description: `Unit kini berstatus ${!car.isAvailable ? 'Available' : 'Rented'}.`,
        variant: 'success',
      });
    } catch {
      showToast({
        title: 'Koneksi gagal',
        description: 'Tidak dapat menghubungi server.',
        variant: 'danger',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDeleteCar = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/cars/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        showToast({
          title: 'Unit tidak dapat dihapus',
          description:
            data.error || 'Mobil yang memiliki riwayat booking tidak dapat dihapus permanen.',
          variant: 'danger',
        });
        setDeleteTarget(null);
        return;
      }

      setCars((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      showToast({
        title: 'Armada berhasil dihapus.',
        description: `${deleteTarget.brand} ${deleteTarget.name} telah dihapus dari katalog.`,
        variant: 'success',
      });
      setDeleteTarget(null);
    } catch {
      showToast({
        title: 'Gagal menghapus unit',
        description: 'Periksa koneksi Anda lalu coba lagi.',
        variant: 'danger',
      });
    } finally {
      setDeleting(false);
    }
  };

  const hasFilter = search.trim() !== '' || statusFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Header (DSG §20.4) */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-primary sm:text-3xl">
            Manajemen Mobil
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Kelola spesifikasi unit, tarif harian, dan status ketersediaan seluruh armada Carry.
          </p>
        </div>

        <Link href="/admin/cars/new" className="btn-primary self-start sm:self-auto">
          Tambah Mobil
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:min-w-[240px]">
          <label htmlFor="admin-car-search" className="sr-only">
            Cari nama atau merek mobil
          </label>
          <input
            id="admin-car-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau merek mobil..."
            className="field-control"
          />
        </div>

        <div
          role="group"
          aria-label="Filter status ketersediaan unit"
          className="inline-flex items-center gap-1 rounded-[10px] border border-border-control bg-surface p-1"
        >
          {(
            [
              { id: 'all', label: 'Semua' },
              { id: 'available', label: 'Available' },
              { id: 'rented', label: 'Rented' },
            ] as const
          ).map((item) => {
            const active = statusFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setStatusFilter(item.id)}
                className={`min-h-9 flex-1 rounded-lg px-3 text-[13px] transition-colors sm:flex-none ${
                  active
                    ? 'bg-brand-soft font-semibold text-text-brand'
                    : 'font-medium text-secondary hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
            }}
            className="btn-ghost btn-sm self-start sm:self-auto"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* States & Data View */}
      {loading ? (
        <div aria-label="Memuat tabel armada" aria-live="polite" className="space-y-3">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div key={idx} className="skeleton h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="alert-box alert-danger flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>
          <button type="button" onClick={handleReload} className="btn-secondary shrink-0">
            Coba Lagi
          </button>
        </div>
      ) : cars.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-control bg-surface px-6 py-14 text-center">
          <h2 className="font-display text-lg font-semibold text-primary">
            Belum ada armada terdaftar
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-secondary">
            Tambahkan unit mobil pertama agar pelanggan dapat melihat dan memesan kendaraan di katalog publik.
          </p>
          <Link href="/admin/cars/new" className="btn-primary mt-5">
            Tambah Mobil Pertama
          </Link>
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-control bg-surface px-6 py-12 text-center">
          <h2 className="font-display text-lg font-semibold text-primary">
            Tidak ada data yang cocok
          </h2>
          <p className="mt-1.5 text-sm text-secondary">
            Ubah kata kunci pencarian atau pilihan status ketersediaan.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
            }}
            className="btn-secondary mt-4"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table (>= 768px: DSG §11.8 & §20.4) */}
          <div className="data-table-wrap hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kendaraan</th>
                  <th>Tahun</th>
                  <th>Spesifikasi</th>
                  <th className="text-right">Tarif / Hari</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCars.map((car) => {
                  const specs = [
                    car.seats ? `${car.seats} Kursi` : null,
                    car.transmission || null,
                    car.fuel || null,
                  ]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <tr key={car.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <CarRowThumb
                            image={car.image}
                            alt={`${car.brand} ${car.name}`}
                          />
                          <div className="min-w-0">
                            <p
                              title={car.name}
                              className="max-w-[200px] truncate font-semibold text-primary"
                            >
                              {car.name}
                            </p>
                            <p className="text-xs text-secondary">{car.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="tabular-nums text-secondary">{car.year}</td>
                      <td className="text-secondary">{specs || '-'}</td>
                      <td className="text-right tabular-nums font-semibold text-primary">
                        {formatRupiah(car.pricePerDay)}
                      </td>
                      <td>
                        <CarAvailabilityBadge isAvailable={car.isAvailable} />
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={togglingId === car.id}
                            onClick={() => handleToggleAvailability(car)}
                            className="btn-ghost btn-sm"
                          >
                            {car.isAvailable ? 'Set Rented' : 'Set Available'}
                          </button>
                          <Link
                            href={`/admin/cars/${car.id}/edit`}
                            className="btn-secondary btn-sm"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(car)}
                            className="btn-danger-soft btn-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (< 768px: DSG §11.8 Responsive Rule) */}
          <div className="space-y-3 md:hidden">
            {filteredCars.map((car) => (
              <article key={car.id} className="surface-card space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <CarRowThumb image={car.image} alt={`${car.brand} ${car.name}`} />
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-base font-semibold text-primary">
                        {car.name}
                      </h2>
                      <p className="text-xs text-secondary">
                        {car.brand} &bull; {car.year}
                      </p>
                    </div>
                  </div>
                  <CarAvailabilityBadge isAvailable={car.isAvailable} />
                </div>

                <dl className="grid grid-cols-2 gap-2 border-y border-border-subtle py-3 text-xs">
                  <div>
                    <dt className="text-muted">Tarif Harian</dt>
                    <dd className="mt-0.5 tabular-nums font-semibold text-primary">
                      {formatRupiah(car.pricePerDay)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Spesifikasi</dt>
                    <dd className="mt-0.5 text-secondary">
                      {[
                        car.seats ? `${car.seats} Kursi` : null,
                        car.transmission || null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || '-'}
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={togglingId === car.id}
                    onClick={() => handleToggleAvailability(car)}
                    className="btn-ghost btn-sm flex-1"
                  >
                    {car.isAvailable ? 'Set Rented' : 'Set Available'}
                  </button>
                  <Link
                    href={`/admin/cars/${car.id}/edit`}
                    className="btn-secondary btn-sm flex-1"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(car)}
                    className="btn-danger-soft btn-sm flex-1"
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal (DSG §11.14 & §20.4) */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Hapus unit mobil ini?"
        danger
        description={
          deleteTarget
            ? `Anda akan menghapus ${deleteTarget.brand} ${deleteTarget.name} dari katalog. Demi integritas data, sistem menolak penghapusan permanen apabila unit sudah memiliki riwayat booking.`
            : undefined
        }
        footer={
          <>
            <button
              type="button"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
              className="btn-secondary w-full sm:w-auto"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={confirmDeleteCar}
              className="btn-danger-solid w-full sm:w-auto"
            >
              {deleting ? 'Menghapus...' : 'Ya, Hapus Unit'}
            </button>
          </>
        }
      />
    </div>
  );
}
