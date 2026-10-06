'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error('Gagal fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname]);

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Gagal logout:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-colors duration-200 ${
        scrolled
          ? 'bg-[#141414]/90 backdrop-blur-md border-b border-white/5'
          : 'bg-[#141414]/70 backdrop-blur-sm border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-[#474dec] flex items-center justify-center text-white font-bold text-sm tracking-tighter">
            C
          </div>
          <span className="text-lg font-bold tracking-tight text-[#f3f4f6] group-hover:text-white transition-colors">
            Carry
          </span>
        </Link>

        {/* Menu Items */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive('/') && pathname === '/'
                ? 'bg-white/10 text-white'
                : 'text-[#aaaaaa] hover:text-white hover:bg-white/5'
            }`}
          >
            Beranda
          </Link>

          <Link
            href="/cars"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive('/cars')
                ? 'bg-white/10 text-white'
                : 'text-[#aaaaaa] hover:text-white hover:bg-white/5'
            }`}
          >
            Daftar Mobil
          </Link>

          {loading ? (
            <span className="px-3 py-1.5 text-[#666666] text-xs">Memuat...</span>
          ) : user ? (
            <>
              {user.role === 'ADMIN' ? (
                <>
                  <Link
                    href="/admin"
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'bg-white/10 text-white'
                        : 'text-[#aaaaaa] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/bookings"
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive('/bookings')
                        ? 'bg-white/10 text-white'
                        : 'text-[#aaaaaa] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Booking Masuk
                  </Link>
                </>
              ) : (
                <Link
                  href="/my-bookings"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/my-bookings')
                      ? 'bg-white/10 text-white'
                      : 'text-[#aaaaaa] hover:text-white hover:bg-white/5'
                  }`}
                >
                  Booking Saya
                </Link>
              )}

              <div className="ml-3 pl-3 border-l border-white/10 flex items-center gap-3">
                <span className="text-xs text-[#aaaaaa]">
                  Halo, <span className="text-[#f3f4f6] font-medium">{user.name}</span>
                </span>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-medium text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-md hover:bg-[#f87171]/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-[#aaaaaa] hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-sm font-semibold bg-[#474dec] text-white rounded-md hover:bg-[#3a39e0] transition-colors"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}