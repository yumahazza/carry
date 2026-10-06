'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      router.push('/bookings');
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
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#a5b4fc]">Welcome back</p>
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-primary xl:text-5xl">Your next journey starts here.</h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-secondary">
            Sign in to manage your bookings and find the right vehicle for every trip.
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
          <h1 className="text-2xl font-bold tracking-tight text-primary">Selamat Datang Kembali</h1>
          <p className="mt-2 text-sm text-secondary">Masuk ke akun Carry Rental Anda</p>
        </div>

        {error && (
          <div id="login-error" role="alert" aria-live="assertive" className="mb-5 rounded-xl border border-[rgba(251,113,133,0.28)] bg-[rgba(251,113,133,0.12)] px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="field-label">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-describedby={error ? 'login-error' : undefined}
              className="field-control"
              placeholder="admin@carry.com"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="field-label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-describedby={error ? 'login-error' : undefined}
              className="field-control"
              placeholder="Masukkan password"
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
                <span>Memproses...</span>
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <div className="mt-7 space-y-3 border-t border-border-subtle pt-5 text-center">
          <p className="text-sm text-secondary">
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-[#a5b4fc] underline-offset-4 transition-colors hover:text-primary hover:underline">
              Daftar sekarang
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