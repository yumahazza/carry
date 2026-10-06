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
    <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4 py-12">
      <div className="w-full max-w-md bg-[#1f1f1f] border border-white/10 rounded-xl p-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-8 h-8 rounded-md bg-[#474dec] flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
            <span className="text-xl font-bold tracking-tight text-[#f3f4f6]">Carry</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Selamat Datang Kembali</h1>
          <p className="text-xs text-[#aaaaaa] mt-1.5">Masuk ke akun Carry Rental Anda</p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-[#f87171]/20 bg-[#f87171]/10 px-4 py-2.5 text-xs text-[#f87171]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#141414] border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-[#f3f4f6] placeholder-[#666666] focus:outline-none focus:border-[#474dec] focus:ring-2 focus:ring-[#474dec]/50 transition-all"
              placeholder="admin@carry.com"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#aaaaaa] uppercase tracking-wider mb-2 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#141414] border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-[#f3f4f6] placeholder-[#666666] focus:outline-none focus:border-[#474dec] focus:ring-2 focus:ring-[#474dec]/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#474dec] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a39e0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
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

        <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-3">
          <p className="text-xs text-[#aaaaaa]">
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-[#474dec] hover:text-[#3a39e0] transition-colors">
              Daftar sekarang
            </Link>
          </p>

          <div>
            <Link href="/" className="text-xs text-[#666666] hover:text-[#aaaaaa] transition-colors">
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}