'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'CUSTOMER' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registrasi gagal');
      }

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[5fr_7fr]">
      <aside className="hidden flex-col justify-between border-r border-border-subtle bg-surface px-10 py-12 lg:flex xl:px-16">
        <Link href="/" className="inline-flex w-fit items-center gap-3 rounded-lg focus-visible:outline-none">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand font-bold text-white">C</span>
          <span className="text-lg font-bold tracking-tight text-primary">Carry</span>
        </Link>
        <div className="max-w-lg pb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#a5b4fc]">Start exploring</p>
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-primary xl:text-5xl">A better ride for every plan.</h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-secondary">
            Create an account to explore the fleet and keep your bookings together.
          </p>
        </div>
        <p className="text-xs text-muted">Carry • Premium car rental</p>
      </aside>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
      <div className="w-full max-w-[440px] rounded-2xl border border-border-default bg-surface p-6 sm:p-8">
        {/* Brand Header */}
        <div className="mb-7 text-center">
          <Link href="/" className="group mb-4 inline-flex items-center gap-2 rounded-lg focus-visible:outline-none lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
              C
            </span>
            <span className="text-xl font-bold tracking-tight text-primary">Carry</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Buat Akun Baru</h1>
          <p className="mt-2 text-sm text-secondary">Bergabung dengan Carry Rental untuk kemudahan sewa armada</p>
        </div>

        {error && (
          <div id="register-error" role="alert" aria-live="assertive" className="mb-5 rounded-xl border border-[rgba(251,113,133,0.28)] bg-[rgba(251,113,133,0.12)] px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="field-label">
              Nama Lengkap
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-describedby={error ? 'register-error' : undefined}
              className="field-control"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="field-label">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-describedby={error ? 'register-error' : undefined}
              className="field-control"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="field-label">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              aria-describedby={error ? 'register-error' : undefined}
              className="field-control"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 w-full"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Mendaftarkan...</span>
              </>
            ) : (
              'Daftar Sekarang'
            )}
          </button>
        </form>

        <div className="mt-7 space-y-3 border-t border-border-subtle pt-5 text-center">
          <p className="text-sm text-secondary">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-[#a5b4fc] underline-offset-4 transition-colors hover:text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>

          <div>
            <Link href="/" className="inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 transition-colors hover:text-primary hover:underline">
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
      </section>
    </div>
  );
}