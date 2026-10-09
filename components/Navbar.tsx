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

  const navLinkClass = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none ${active
      ? 'bg-[rgba(71,77,236,0.12)] text-[#a5b4fc]'
      : 'text-secondary hover:bg-white/5 hover:text-primary'
    }`;

  return (
    <nav
      aria-label="Navigasi utama"
      className={`sticky top-0 z-50 h-16 border-b border-border-subtle transition-colors duration-150 ${scrolled
          ? 'bg-canvas/95 shadow-xs backdrop-blur-md'
          : 'bg-canvas/85 backdrop-blur-md'
        }`}
    >
      <div className="page-container-wide flex h-full items-center justify-between gap-4">
        <Link href="/" className="group inline-flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold tracking-tight text-white">
            C
          </span>
          <span className="text-lg font-bold tracking-tight text-primary transition-colors group-hover:text-white">
            Carry
          </span>
        </Link>

        <div className="hidden min-w-0 items-center gap-1 lg:flex">
          <Link href="/" aria-current={isActive('/') ? 'page' : undefined} className={navLinkClass(isActive('/'))}>
            Beranda
          </Link>

          <Link
            href="/cars"
            aria-current={isActive('/cars') ? 'page' : undefined}
            className={navLinkClass(isActive('/cars'))}
          >
            Daftar Mobil
          </Link>

          {loading ? (
            <span aria-live="polite" className="px-3 py-1.5 text-xs text-muted">Memuat...</span>
          ) : user ? (
            <>
              {user.role === 'ADMIN' ? (
                <>
                  <Link
                    href="/admin"
                    aria-current={isActive('/admin') ? 'page' : undefined}
                    className={navLinkClass(isActive('/admin'))}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/bookings"
                    aria-current={isActive('/bookings') ? 'page' : undefined}
                    className={navLinkClass(isActive('/bookings'))}
                  >
                    Booking Masuk
                  </Link>
                </>
              ) : (
                <Link
                  href="/my-bookings"
                  aria-current={isActive('/my-bookings') ? 'page' : undefined}
                  className={navLinkClass(isActive('/my-bookings'))}
                >
                  Booking Saya
                </Link>
              )}

              <div className="ml-2 flex items-center gap-3 border-l border-border-default pl-4">
                <span className="max-w-36 truncate text-xs text-secondary">
                  Halo, <span className="font-medium text-primary">{user.name}</span>
                </span>

                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/';
                  }}
                  className="text-sm font-medium text-[#A1A1AA] hover:text-[#FB7185] transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link
                href="/login"
                className="btn-ghost"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="btn-primary min-h-10 px-4"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        <details key={pathname} className="mobile-menu relative lg:hidden">
          <summary
            aria-label="Menu navigasi"
            className="flex h-11 w-11 list-none items-center justify-center rounded-lg border border-border-default bg-white/[0.04] text-primary transition-colors hover:bg-white/[0.08] focus-visible:outline-none [&::-webkit-details-marker]:hidden"
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border-default bg-surface p-2 shadow-md">
            <div className="flex flex-col">
              <Link href="/" aria-current={isActive('/') ? 'page' : undefined} className={navLinkClass(isActive('/'))}>
                Beranda
              </Link>
              <Link href="/cars" aria-current={isActive('/cars') ? 'page' : undefined} className={navLinkClass(isActive('/cars'))}>
                Daftar Mobil
              </Link>
              {!loading && user?.role === 'ADMIN' && (
                <>
                  <Link href="/admin" aria-current={isActive('/admin') ? 'page' : undefined} className={navLinkClass(isActive('/admin'))}>
                    Dashboard
                  </Link>
                  <Link href="/bookings" aria-current={isActive('/bookings') ? 'page' : undefined} className={navLinkClass(isActive('/bookings'))}>
                    Booking Masuk
                  </Link>
                </>
              )}
              {!loading && user && user.role !== 'ADMIN' && (
                <Link href="/my-bookings" aria-current={isActive('/my-bookings') ? 'page' : undefined} className={navLinkClass(isActive('/my-bookings'))}>
                  Booking Saya
                </Link>
              )}
              {loading ? (
                <span className="px-3 py-3 text-sm text-muted">Memuat...</span>
              ) : user ? (
                <div className="mt-2 border-t border-border-subtle pt-2">
                  <p className="truncate px-3 py-2 text-sm text-secondary">
                    Halo, <span className="font-medium text-primary">{user.name}</span>
                  </p>
                  <button onClick={handleLogout} className="btn-danger-soft w-full">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border-subtle pt-2">
                  <Link href="/login" className="btn-secondary">Masuk</Link>
                  <Link href="/register" className="btn-primary">Daftar</Link>
                </div>
              )}
            </div>
          </div>
        </details>
      </div>
    </nav>
  );
}