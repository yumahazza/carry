import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="page-container py-20 text-center sm:py-28">
      <div className="mx-auto max-w-md rounded-2xl border border-border-default bg-surface p-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-text-brand">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-primary">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          Alamat yang Anda tuju tidak tersedia atau telah dipindahkan. Gunakan tautan di bawah untuk kembali menjelajahi armada.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary">
            Ke Beranda
          </Link>
          <Link href="/cars" className="btn-secondary">
            Daftar Mobil
          </Link>
        </div>
      </div>
    </div>
  );
}

