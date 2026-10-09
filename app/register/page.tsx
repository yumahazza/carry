'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        return;
      }

      // Redirect ke my-bookings setelah register
      router.push('/my-bookings');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0F1115]">
      <div className="w-full max-w-md">
        <div className="bg-[#151922] border border-[rgba(255,255,255,0.10)] rounded-2xl p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-[#F8FAFC]">
              Carry<span className="text-[#474DEC]">.</span>
            </Link>
            <h1 className="text-2xl font-bold text-[#F8FAFC] mt-6">Create your account</h1>
            <p className="text-sm text-[#A1A1AA] mt-2">Book your next ride in a few steps.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 rounded-lg border border-[rgba(251,113,133,0.28)] bg-[rgba(251,113,133,0.12)] p-4 text-sm text-[#FB7185]">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#151922] border border-[rgba(255,255,255,0.10)] rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#71717A] focus:outline-none focus:border-[#474DEC] focus:ring-2 focus:ring-[rgba(71,77,236,0.18)] transition-all"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#151922] border border-[rgba(255,255,255,0.10)] rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#71717A] focus:outline-none focus:border-[#474DEC] focus:ring-2 focus:ring-[rgba(71,77,236,0.18)] transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#151922] border border-[rgba(255,255,255,0.10)] rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#71717A] focus:outline-none focus:border-[#474DEC] focus:ring-2 focus:ring-[rgba(71,77,236,0.18)] transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#151922] border border-[rgba(255,255,255,0.10)] rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#71717A] focus:outline-none focus:border-[#474DEC] focus:ring-2 focus:ring-[rgba(71,77,236,0.18)] transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#474DEC] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#3E43D6] active:bg-[#3439BF] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-sm text-[#A1A1AA] text-center mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#474DEC] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}