import Link from 'next/link';

/**
 * Footer komersial terfokus sesuai keputusan R-37 (R-05 & R-24):
 * hanya memuat rute nyata yang benar-benar ada tanpa 4 kolom template kosong atau link mati.
 */
export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface py-10 sm:py-12">
      <div className="page-container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <Link
              href="/"
              className="inline-block font-display text-lg font-bold tracking-[-0.02em] text-primary"
            >
              Carry<span className="text-brand">.</span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-secondary">
              Layanan penyewaan mobil harian dengan perhitungan tarif transparan, status ketersediaan unit secara langsung, dan pengelolaan pesanan mandiri.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:col-span-6 md:justify-items-end">
            <div className="w-full md:w-auto">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                Navigasi Armada
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="inline-flex min-h-9 items-center text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
                  >
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cars"
                    className="inline-flex min-h-9 items-center text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
                  >
                    Daftar Mobil
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-bookings"
                    className="inline-flex min-h-9 items-center text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
                  >
                    Pesanan Saya
                  </Link>
                </li>
              </ul>
            </div>

            <div className="w-full md:w-auto">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                Akses Akun
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/login"
                    className="inline-flex min-h-9 items-center text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
                  >
                    Masuk
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="inline-flex min-h-9 items-center text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
                  >
                    Buat Akun Baru
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-border-subtle pt-5 text-xs text-muted sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Carry. Seluruh hak cipta dilindungi.</p>
          <p>Seluruh tarif kendaraan dihitung per hari dalam mata uang Rupiah (IDR).</p>
        </div>
      </div>
    </footer>
  );
}
