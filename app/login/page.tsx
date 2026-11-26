'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeProvider';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Masukkan alamat email yang valid.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Kata sandi wajib diisi.');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Email atau kata sandi salah.');
        return;
      }

      if (redirectTarget && redirectTarget.startsWith('/')) {
        router.push(redirectTarget);
        return;
      }

      if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/my-bookings');
      }
    } catch {
      setFormError('Gagal menghubungi server. Periksa koneksi Anda lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const registerHref = redirectTarget
    ? `/register?redirect=${encodeURIComponent(redirectTarget)}`
    : '/register';

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-canvas lg:grid-cols-12">
      {/* Desktop Brand Editorial Panel (DSG §22.1 & §22.2) */}
      <div className="hidden flex-col justify-between border-r border-border-subtle bg-surface p-10 lg:col-span-5 lg:flex xl:p-12">
        <div>
          <Link
            href="/"
            className="inline-block font-display text-xl font-bold tracking-[-0.02em] text-primary"
          >
            Carry<span className="text-brand">.</span>
          </Link>
        </div>

        <div className="max-w-md space-y-6">
          <h2 className="font-display text-3xl font-bold leading-[1.18] tracking-[-0.02em] text-primary">
            Kelola jadwal sewa dan status kendaraan Anda dalam satu tempat.
          </h2>
          <p className="text-base leading-relaxed text-secondary">
            Pantau konfirmasi pesanan, rincian biaya harian, serta riwayat perjalanan tanpa perlu konfirmasi manual berulang.
          </p>
          <ul className="space-y-3 border-t border-border-subtle pt-6 text-sm text-secondary">
            <li className="flex items-start gap-2.5">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>Tarif sewa harian transparan tanpa biaya tersembunyi</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>Status ketersediaan unit diperbarui langsung saat disetujui</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>Pembatalan mandiri untuk pesanan yang masih aktif</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-muted">
          Sesi Anda dilindungi dengan cookie HTTP-only terenkripsi.
        </p>
      </div>

      {/* Form Panel */}
      <div className="flex flex-col justify-between px-4 py-6 sm:px-8 lg:col-span-7 lg:py-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-[-0.02em] text-primary lg:invisible"
          >
            Carry<span className="text-brand">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/cars" className="btn-ghost btn-sm">
              Lihat Armada
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto my-8 w-full max-w-[420px]">
          <div className="rounded-2xl border border-border-default bg-surface p-6 shadow-[var(--shadow-sm-val)] sm:p-8">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-primary sm:text-[28px]">
                Selamat Datang Kembali
              </h1>
              <p className="mt-1.5 text-sm text-secondary">
                Masuk untuk mengelola pesanan atau melanjutkan penyewaan Anda.
              </p>
            </div>

            {formError && (
              <div role="alert" className="alert-box alert-danger mb-5">
                <svg
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="login-email" className="field-label">
                  Alamat Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? 'login-email-error' : undefined}
                  placeholder="nama@email.com"
                  className="field-control"
                />
                {emailError && (
                  <p id="login-email-error" role="alert" className="mt-1.5 text-[13px] text-danger">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="field-label">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    aria-invalid={Boolean(passwordError)}
                    aria-describedby={passwordError ? 'login-password-error' : undefined}
                    placeholder="Masukkan kata sandi"
                    className="field-control pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-lg text-muted transition-colors hover:text-primary"
                  >
                    {showPassword ? (
                      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 0 0 2.83 2.83M9.88 5.09A9.77 9.77 0 0 1 12 5c5 0 9.27 3.11 11 7.5a11.77 11.77 0 0 1-4.35 5.36M6.61 6.61A11.8 11.8 0 0 0 1 12.5C2.73 16.89 7 20 12 20a9.86 9.86 0 0 0 5.39-1.61" />
                      </svg>
                    ) : (
                      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p id="login-password-error" role="alert" className="mt-1.5 text-[13px] text-danger">
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary btn-lg mt-2 w-full"
              >
                {loading ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-secondary">
              Belum punya akun?{' '}
              <Link
                href={registerHref}
                className="font-semibold text-text-brand underline-offset-4 hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-muted lg:hidden">
            Sesi Anda dilindungi dengan cookie HTTP-only.
          </p>
        </div>

        <div aria-hidden="true" className="hidden lg:block" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-canvas p-6">
          <div className="skeleton h-[420px] w-full max-w-[420px] rounded-2xl" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}