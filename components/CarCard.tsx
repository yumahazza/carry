'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CarAvailabilityBadge } from '@/components/ui/StatusBadge';
import { formatRupiah } from '@/lib/format';

export interface CarSummary {
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

interface CarCardProps {
  car: CarSummary;
  priority?: boolean;
}

/**
 * Komponen Kartu Mobil sesuai DSG §11.5 & R-40:
 * - Gambar memiliki dimensi intrinsik (width=800, height=500, aspect 16/10).
 * - Fallback SVG netral (bukan foto palsu) saat gambar kosong atau gagal dimuat.
 * - Hirarki: Konteks Gambar -> Nama & Status -> Brand/Tahun/Spek -> Harga/Hari -> Affordance Detail.
 */
export default function CarCard({ car, priority = false }: CarCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasValidImage = Boolean(car.image && !imgFailed);

  const specItems = [
    car.seats ? `${car.seats} Kursi` : null,
    car.transmission || null,
    car.fuel || null,
  ].filter(Boolean);

  return (
    <Link
      href={`/cars/${car.id}`}
      className="interactive-card group flex flex-col overflow-hidden p-0 focus-visible:outline-none"
    >
      <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden border-b border-border-subtle bg-surface-raised">
        {hasValidImage ? (
          <img
            src={car.image as string}
            alt={`${car.brand} ${car.name} tahun ${car.year}`}
            width={800}
            height={500}
            loading={priority ? undefined : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-[260ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center px-4 text-center text-muted">
            <svg
              aria-hidden="true"
              className="h-11 w-11 stroke-current"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 17h14v-4l-2.2-5.5A1.5 1.5 0 0 0 15.4 6.5H8.6a1.5 1.5 0 0 0-1.4.95L5 13v4z" />
              <circle cx="7.5" cy="17.5" r="1.75" />
              <circle cx="16.5" cy="17.5" r="1.75" />
              <path d="M5.5 13h13" />
            </svg>
            <span className="mt-2 text-xs font-medium text-secondary">
              {car.brand} {car.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-2.5">
            <h3
              title={car.name}
              className="truncate font-display text-lg font-semibold tracking-[-0.01em] text-primary"
            >
              {car.name}
            </h3>
            <CarAvailabilityBadge isAvailable={car.isAvailable} />
          </div>

          <p className="mt-1 text-sm text-secondary">
            {car.brand} <span aria-hidden="true">&bull;</span> {car.year}
          </p>

          {specItems.length > 0 && (
            <p className="mt-2.5 truncate text-xs font-medium text-muted">
              {specItems.join(' · ')}
            </p>
          )}
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-border-subtle pt-4">
          <div>
            <span className="tabular-nums font-display text-xl font-bold text-primary">
              {formatRupiah(car.pricePerDay)}
            </span>
            <span className="ml-1 text-[13px] text-muted">/ hari</span>
          </div>
          <span className="text-sm font-semibold text-text-brand underline-offset-4 group-hover:underline">
            Lihat Detail
          </span>
        </div>
      </div>
    </Link>
  );
}

