'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeProvider';
import { useToast } from '@/components/ui/ToastProvider';

function evaluatePasswordStrength(pw: string): {
  level: 0 | 1 | 2 | 3;
  label: string;
  barClass: string;
} {
  if (!pw) return { level: 0, label: 'Minimal 8 karakter', barClass: 'bg-border-subtle' };
  if (pw.length < 8) {
    return { level: 1, label: 'Lemah (kurang dari 8 karakter)', barClass: 'bg-danger' };
  }
  const hasMixed = /[a-zA-Z]/.test(pw) && /\d/.test(pw);
  const hasExtra = pw.length >= 10 && /[^a-zA-Z0-9]/.test(pw);
  if (hasMixed && hasExtra) {
    return { level: 3, label: 'Kuat', barClass: 'bg-success' };
  }
  if (hasMixed || pw.length >= 10) {
    return { level: 2, label: 'Cukup kuat', barClass: 'bg-warning' };
  }
  return { level: 1, label: 'Cukup (tambahkan angka agar lebih aman)', barClass: 'bg-warning' };
}

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const redirectTarget = searchParams.get('redirect') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (name.trim().length < 2) {
      nextErrors.name = 'Nama lengkap minimal 2 karakter.';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Masukkan alamat email yang valid.';
    }
    if (password.length < 8) {
      nextErrors.password = 'Kata sandi minimal 8 karakter.';
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Konfirmasi kata sandi tidak cocok.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Pendaftaran gagal. Silakan periksa kembali data Anda.');
        return;
      }

      showToast({
        title: 'Akun berhasil dibuat.',
        description: 'Selamat datang di Carry. Anda telah masuk secara otomatis.',
        variant: 'success',
      });

      if (redirectTarget && redirectTarget.startsWith('/')) {
        router.push(redirectTarget);
      } else {
        router.push('/cars');
      }
    } catch {
      setFormError('Gagal menghubungi server. Periksa koneksi Anda lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const loginHref = redirectTarget
    ? `/login?redirect=${encodeURIComponent(redirectTarget)}`
    : '/login';

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-canvas lg:grid-cols-12">
      {/* Desktop Brand Panel (DSG §23.1 & §22.2) */}
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
            Mulai sewa kendaraan dengan data pemesan yang tersimpan rapi.
          </h2>
          <p className="text-base leading-relaxed text-secondary">
            Satu akun memudahkan Anda memesan unit lebih cepat tanpa mengisi ulang identitas setiap kali menyewa.
          </p>
          <ul className="space-y-3 border-t border-border-subtle pt-6 text-sm text-secondary">
            <li className="flex items-start gap-2.5">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>Identitas pemesan terisi otomatis saat memilih tanggal sewa</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>Riwayat perjalanan dan kode booking tersimpan terpusat</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>Akses langsung ke seluruh armada yang siap disewa</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-muted">
          Kata sandi disimpan menggunakan hash terenkripsi di sisi server.
        </p>
      </div>

      {/* Form Panel */}
      <div className="flex flex-col justify-between px-4 py-6 sm:px-8 lg:col-span-7 lg:py-8">
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

        <div className="mx-auto my-6 w-full max-w-[440px]">
          <div className="rounded-2xl border border-border-default bg-surface p-6 shadow-[var(--shadow-sm-val)] sm:p-8">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-primary sm:text-[28px]">
                Buat Akun Baru
              </h1>
              <p className="mt-1.5 text-sm text-secondary">
                Pesan kendaraan pilihan Anda hanya dalam beberapa langkah.
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
                <label htmlFor="register-name" className="field-label">
                  Nama Lengkap
                </label>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'register-name-error' : undefined}
                  placeholder="Nama lengkap sesuai identitas"
                  className="field-control"
                />
                {errors.name && (
                  <p id="register-name-error" role="alert" className="mt-1.5 text-[13px] text-danger">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-email" className="field-label">
                  Alamat Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'register-email-error' : undefined}
                  placeholder="nama@email.com"
                  className="field-control"
                />
                {errors.email && (
                  <p id="register-email-error" role="alert" className="mt-1.5 text-[13px] text-danger">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-phone" className="field-label">
                  Nomor Telepon (Opsional)
                </label>
                <input
                  id="register-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="field-control"
                />
              </div>

              <div>
                <label htmlFor="register-password" className="field-label">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? 'register-password-error' : 'register-password-strength'
                    }
                    placeholder="Minimal 8 karakter"
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

                {/* Password Strength Meter (DSG §23.4: paired with text label) */}
                <div id="register-password-strength" className="mt-2">
                  <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
                    {[1, 2, 3].map((step) => (
                      <span
                        key={step}
                        className={`h-1 rounded-full transition-colors ${
                          strength.level >= step ? strength.barClass : 'bg-surface-overlay'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Kekuatan kata sandi: <span className="font-medium text-secondary">{strength.label}</span>
                  </p>
                </div>

                {errors.password && (
                  <p id="register-password-error" role="alert" className="mt-1 text-[13px] text-danger">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-confirm-password" className="field-label">
                  Konfirmasi Kata Sandi
                </label>
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined}
                  placeholder="Ulangi kata sandi"
                  className="field-control"
                />
                {errors.confirmPassword && (
                  <p id="register-confirm-error" role="alert" className="mt-1.5 text-[13px] text-danger">
                    {errors.confirmPassword}
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
                    <span>Mendaftarkan...</span>
                  </>
                ) : (
                  'Buat Akun'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-secondary">
              Sudah punya akun?{' '}
              <Link
                href={loginHref}
                className="font-semibold text-text-brand underline-offset-4 hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <div aria-hidden="true" className="hidden lg:block" />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-canvas p-6">
          <div className="skeleton h-[540px] w-full max-w-[440px] rounded-2xl" />
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
