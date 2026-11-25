export const PUBLIC_CAR_SELECT = {
  id: true,
  name: true,
  brand: true,
  year: true,
  pricePerDay: true,
  isAvailable: true,
  image: true,
  description: true,
  seats: true,
  transmission: true,
  fuel: true,
  createdAt: true,
} as const;

export interface CarInputPayload {
  name?: unknown;
  brand?: unknown;
  year?: unknown;
  pricePerDay?: unknown;
  isAvailable?: unknown;
  image?: unknown;
  description?: unknown;
  seats?: unknown;
  transmission?: unknown;
  fuel?: unknown;
}

export interface ValidatedCarData {
  name: string;
  brand: string;
  year: number;
  pricePerDay: number;
  isAvailable: boolean;
  image: string | null;
  description: string | null;
  seats: number | null;
  transmission: string | null;
  fuel: string | null;
}

/**
 * Validate and normalize car creation/update payloads against PRD §9.3 rules.
 */
export function validateCarPayload(
  body: CarInputPayload,
  { partial = false }: { partial?: boolean } = {}
): { data?: Partial<ValidatedCarData>; error?: string } {
  const data: Partial<ValidatedCarData> = {};
  const maxYear = new Date().getFullYear() + 1;

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return { error: 'Nama mobil wajib diisi.' };
    }
    data.name = body.name.trim();
  }

  if (!partial || body.brand !== undefined) {
    if (typeof body.brand !== 'string' || !body.brand.trim()) {
      return { error: 'Merek mobil wajib diisi.' };
    }
    data.brand = body.brand.trim();
  }

  if (!partial || body.year !== undefined) {
    const parsedYear = Number(body.year);
    if (!Number.isInteger(parsedYear) || parsedYear < 1990 || parsedYear > maxYear) {
      return { error: `Tahun mobil harus di antara 1990 dan ${maxYear}.` };
    }
    data.year = parsedYear;
  }

  if (!partial || body.pricePerDay !== undefined) {
    const parsedPrice = Number(body.pricePerDay);
    if (!Number.isInteger(parsedPrice) || parsedPrice <= 0) {
      return { error: 'Harga sewa per hari harus lebih dari nol.' };
    }
    data.pricePerDay = parsedPrice;
  }

  if (body.isAvailable !== undefined) {
    if (typeof body.isAvailable !== 'boolean') {
      return { error: 'Status ketersediaan tidak valid.' };
    }
    data.isAvailable = body.isAvailable;
  } else if (!partial) {
    data.isAvailable = true;
  }

  if (body.seats !== undefined) {
    if (body.seats === null || body.seats === '') {
      data.seats = null;
    } else {
      const parsedSeats = Number(body.seats);
      if (!Number.isInteger(parsedSeats) || parsedSeats < 1 || parsedSeats > 20) {
        return { error: 'Jumlah kursi harus berupa angka antara 1 dan 20.' };
      }
      data.seats = parsedSeats;
    }
  }

  for (const field of ['image', 'description', 'transmission', 'fuel'] as const) {
    const val = body[field];
    if (val !== undefined) {
      if (val === null || val === '') {
        data[field] = null;
      } else if (typeof val === 'string') {
        data[field] = val.trim() || null;
      } else {
        return { error: `Field ${field} harus berupa teks.` };
      }
    }
  }

  return { data };
}
