'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeProvider';

interface NavUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Menyimpan path tempat menu dibuka sehingga navigasi otomatis menutup menu tanpa setState di useEffect
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [drawerPath, setDrawerPath] = useState<string | null>(null);

  const userMenuOpen = menuPath === pathname;
  const drawerOpen = drawerPath === pathname;

  const userMenuRef = useRef<HTMLDivElement>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerPanelRef = useRef<HTMLDivElement>(null);

  const skipNavbar =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/admin');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (skipNavbar) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();
        if (!cancelled) {
          setUser(data?.user ?? null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, skipNavbar]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setMenuPath(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuPath(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = drawerPanelRef.current;
    const focusableSelector =
      'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])';

    const raf = requestAnimationFrame(() => {
      const items = panel?.querySelectorAll<HTMLElement>(focusableSelector);
      items?.[0]?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setDrawerPath(null);
        drawerTriggerRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [drawerOpen]);

  if (skipNavbar) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setMenuPath(null);
      setDrawerPath(null);
      router.push('/');
      router.refresh();
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const desktopLinkClass = (active: boolean) =>
    `inline-flex min-h-10 items-center rounded-lg px-3 text-sm transition-colors duration-120 ${
      active
        ? 'bg-brand-soft font-semibold text-text-brand'
        : 'font-medium text-secondary hover:bg-[var(--control-ghost-hover)] hover:text-primary'
    }`;

  const mobileLinkClass = (active: boolean) =>
    `flex min-h-11 w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-colors duration-120 ${
      active
        ? 'bg-brand-soft font-semibold text-text-brand'
        : 'font-medium text-secondary hover:bg-[var(--control-ghost-hover)] hover:text-primary'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 h-16 border-b border-border-subtle backdrop-blur-md transition-shadow duration-150 ${
        scrolled
          ? 'bg-[color-mix(in_srgb,var(--canvas)_90%,transparent)] shadow-[var(--shadow-xs-val)]'
          : 'bg-[color-mix(in_srgb,var(--canvas)_84%,transparent)]'
      }`}
    >
      <nav
        aria-label="Navigasi utama"
        className="page-container flex h-full items-center justify-between gap-4"
      >
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg px-1 font-display text-lg font-bold tracking-[-0.02em] text-primary"
          >
            Carry<span className="text-brand">.</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              aria-current={isActive('/') ? 'page' : undefined}
              className={desktopLinkClass(isActive('/'))}
            >
              Beranda
            </Link>
            <Link
              href="/cars"
              aria-current={isActive('/cars') ? 'page' : undefined}
              className={desktopLinkClass(isActive('/cars'))}
            >
              Daftar Mobil
            </Link>
            {!loading && user && (
              <Link
                href="/my-bookings"
                aria-current={isActive('/my-bookings') ? 'page' : undefined}
                className={desktopLinkClass(isActive('/my-bookings'))}
              >
                Pesanan Saya
              </Link>
            )}
            {!loading && user?.role === 'ADMIN' && (
              <Link href="/admin" className={desktopLinkClass(false)}>
                Area Admin
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <ThemeToggle />

          {loading ? (
            <div aria-label="Memeriksa sesi pengguna" className="skeleton h-10 w-28 rounded-lg" />
          ) : user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuPath(userMenuOpen ? null : pathname)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-label={`Menu akun ${user.name}`}
                className="inline-flex min-h-10 items-center gap-2.5 rounded-lg border border-border-control bg-[var(--control-secondary-bg)] px-2.5 py-1 text-sm font-medium text-primary transition-colors hover:border-border-strong hover:bg-[var(--control-secondary-hover)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-text-brand">
                  {getInitials(user.name)}
                </span>
                <span className="max-w-32 truncate">{user.name}</span>
                <svg
                  aria-hidden="true"
                  className={`h-4 w-4 text-muted transition-transform duration-150 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  aria-label="Pilihan akun"
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-xl border border-border-default bg-surface-raised p-2 shadow-[var(--shadow-md-val)]"
                >
                  <div className="border-b border-border-subtle px-3 py-2">
                    <p className="truncate text-sm font-semibold text-primary">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <div className="mt-1.5 flex flex-col gap-1">
                    <Link
                      href="/my-bookings"
                      role="menuitem"
                      onClick={() => setMenuPath(null)}
                      className="flex min-h-9 items-center rounded-lg px-3 text-sm font-medium text-secondary transition-colors hover:bg-surface-overlay hover:text-primary"
                    >
                      Pesanan Saya
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        onClick={() => setMenuPath(null)}
                        className="flex min-h-9 items-center rounded-lg px-3 text-sm font-medium text-secondary transition-colors hover:bg-surface-overlay hover:text-primary"
                      >
                        Workspace Admin
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex min-h-9 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-ghost min-h-10 px-3.5">
                Masuk
              </Link>
              <Link href="/register" className="btn-primary min-h-10 px-4">
                Buat Akun
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            ref={drawerTriggerRef}
            type="button"
            onClick={() => setDrawerPath(pathname)}
            aria-expanded={drawerOpen}
            aria-controls="mobile-public-drawer"
            aria-label="Buka menu navigasi"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-border-control bg-[var(--control-secondary-bg)] px-3 text-sm font-semibold text-primary transition-colors hover:border-border-strong hover:bg-[var(--control-secondary-hover)]"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (DSG §11.1) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <div
            aria-hidden="true"
            onClick={() => {
              setDrawerPath(null);
              drawerTriggerRef.current?.focus();
            }}
            className="fixed inset-0 z-40 bg-backdrop"
          />
          <div
            id="mobile-public-drawer"
            ref={drawerPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi utama"
            className="fixed inset-y-0 right-0 z-50 flex w-[min(300px,calc(100vw-24px))] flex-col justify-between border-l border-border-default bg-surface p-4 shadow-[var(--shadow-lg-val)]"
          >
            <div>
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <span className="font-display text-lg font-bold tracking-[-0.02em] text-primary">
                  Carry<span className="text-brand">.</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerPath(null);
                    drawerTriggerRef.current?.focus();
                  }}
                  aria-label="Tutup menu navigasi"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-raised hover:text-primary"
                >
                  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-1">
                <Link
                  href="/"
                  onClick={() => setDrawerPath(null)}
                  aria-current={isActive('/') ? 'page' : undefined}
                  className={mobileLinkClass(isActive('/'))}
                >
                  <span>Beranda</span>
                </Link>
                <Link
                  href="/cars"
                  onClick={() => setDrawerPath(null)}
                  aria-current={isActive('/cars') ? 'page' : undefined}
                  className={mobileLinkClass(isActive('/cars'))}
                >
                  <span>Daftar Mobil</span>
                </Link>
                {!loading && user && (
                  <Link
                    href="/my-bookings"
                    onClick={() => setDrawerPath(null)}
                    aria-current={isActive('/my-bookings') ? 'page' : undefined}
                    className={mobileLinkClass(isActive('/my-bookings'))}
                  >
                    <span>Pesanan Saya</span>
                  </Link>
                )}
                {!loading && user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setDrawerPath(null)}
                    className={mobileLinkClass(false)}
                  >
                    <span>Workspace Admin</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="border-t border-border-subtle pt-4">
              {loading ? (
                <div className="skeleton h-11 w-full rounded-lg" />
              ) : user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-text-brand">
                      {getInitials(user.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-primary">{user.name}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                  </div>
                  <button type="button" onClick={handleLogout} className="btn-danger-soft w-full">
                    Keluar dari Akun
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <Link
                    href="/register"
                    onClick={() => setDrawerPath(null)}
                    className="btn-primary w-full"
                  >
                    Buat Akun Baru
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setDrawerPath(null)}
                    className="btn-secondary w-full"
                  >
                    Masuk
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
