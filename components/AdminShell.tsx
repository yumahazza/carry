'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeProvider';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
  badgeCount?: number;
  icon: React.ReactNode;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AD';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getPageTitle(pathname: string): string {
  if (pathname === '/admin') return 'Ringkasan Operasional';
  if (pathname.startsWith('/admin/bookings')) return 'Manajemen Booking';
  if (pathname === '/admin/cars/new') return 'Tambah Mobil Baru';
  if (pathname.includes('/admin/cars/') && pathname.endsWith('/edit')) return 'Edit Data Mobil';
  if (pathname.startsWith('/admin/cars')) return 'Manajemen Mobil';
  if (pathname.startsWith('/admin/dashboard')) return 'Dashboard Analitik';
  return 'Workspace Admin';
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerPath, setMobileDrawerPath] = useState<string | null>(null);

  const mobileOpen = mobileDrawerPath === pathname;

  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [meRes, statsRes] = await Promise.all([
          fetch('/api/auth/me', { credentials: 'include' }),
          fetch('/api/admin/stats', { credentials: 'include' }).catch(() => null),
        ]);

        if (!cancelled && meRes.ok) {
          const meData = await meRes.json();
          setUser(meData?.user ?? null);
        }
        if (!cancelled && statsRes && statsRes.ok) {
          const statsData = await statsRes.json();
          setPendingCount(Number(statsData?.pendingBookings) || 0);
        }
      } catch {
        // Sesi ditangani juga oleh proxy server-side
      } finally {
        if (!cancelled) setUserLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const drawer = mobileDrawerRef.current;
    const focusableSelector =
      'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])';

    const raf = requestAnimationFrame(() => {
      const items = drawer?.querySelectorAll<HTMLElement>(focusableSelector);
      items?.[0]?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileDrawerPath(null);
        mobileTriggerRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !drawer) return;
      const items = Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector));
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
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setMobileDrawerPath(null);
      router.push('/login');
      router.refresh();
    }
  };

  const isItemActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const operationalGroup: NavItem[] = [
    {
      href: '/admin',
      label: 'Beranda Admin',
      exact: true,
      icon: (
        <svg aria-hidden="true" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="5" rx="1.5" />
          <rect x="13" y="10" width="8" height="11" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
        </svg>
      ),
    },
    {
      href: '/admin/bookings',
      label: 'Manajemen Booking',
      badgeCount: pendingCount,
      icon: (
        <svg aria-hidden="true" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path strokeLinecap="round" d="M8 2v4M16 2v4M3 10h18M8 14h4M8 17.5h7" />
        </svg>
      ),
    },
  ];

  const fleetGroup: NavItem[] = [
    {
      href: '/admin/cars',
      label: 'Manajemen Mobil',
      icon: (
        <svg aria-hidden="true" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 17h14v-4l-2.2-5.5A1.5 1.5 0 0 0 15.4 6.5H8.6a1.5 1.5 0 0 0-1.4.95L5 13v4z" />
          <circle cx="7.5" cy="17.5" r="1.75" />
          <circle cx="16.5" cy="17.5" r="1.75" />
        </svg>
      ),
    },
    {
      href: '/admin/dashboard',
      label: 'Dashboard Analitik',
      icon: (
        <svg aria-hidden="true" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M7 16V10M12 16V6M17 16v-4" />
        </svg>
      ),
    },
  ];

  const renderNavLink = (item: NavItem, compact: boolean) => {
    const active = isItemActive(item);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileDrawerPath(null)}
        aria-current={active ? 'page' : undefined}
        aria-label={compact ? item.label : undefined}
        title={compact ? item.label : undefined}
        className={`relative flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors duration-120 lg:min-h-10 ${
          compact ? 'justify-center px-0' : 'justify-between gap-2.5'
        } ${
          active
            ? 'bg-brand-soft font-semibold text-text-brand before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r-full before:bg-brand'
            : 'font-medium text-secondary hover:bg-[var(--control-ghost-hover)] hover:text-primary'
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {item.icon}
          {!compact && <span className="truncate">{item.label}</span>}
        </span>

        {!compact && typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
          <span className="status-badge status-warning px-2 py-0.5 text-[11px] tabular-nums">
            {item.badgeCount}
          </span>
        )}
        {compact && typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
          <span
            aria-label={`${item.badgeCount} pesanan menunggu`}
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-warning"
          />
        )}
      </Link>
    );
  };

  return (
    <div className="flex min-h-dvh bg-canvas">
      <a href="#main-content" className="skip-link">
        Langsung ke konten utama
      </a>

      {/* Desktop Dedicated Sidebar (DSG §11.1B) */}
      <aside
        aria-label="Navigasi admin"
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col justify-between border-r border-border-subtle bg-surface px-3 py-5 transition-[width] duration-180 lg:flex ${
          collapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        <div className="space-y-6">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2'}`}>
            <Link
              href="/admin"
              aria-label="Carry Admin Beranda"
              className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-[-0.02em] text-primary"
            >
              {collapsed ? (
                <span>
                  C<span className="text-brand">.</span>
                </span>
              ) : (
                <>
                  <span>
                    Carry<span className="text-brand">.</span>
                  </span>
                  <span className="status-badge status-brand px-2 py-0.5 text-[11px]">Admin</span>
                </>
              )}
            </Link>
          </div>

          <nav aria-label="Menu operasional admin" className="space-y-5">
            <div>
              {!collapsed ? (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                  Operasional
                </p>
              ) : (
                <div className="mx-2 mb-2 border-t border-border-subtle" />
              )}
              <div className="space-y-1">
                {operationalGroup.map((item) => renderNavLink(item, collapsed))}
              </div>
            </div>

            <div>
              {!collapsed ? (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                  Armada &amp; Data
                </p>
              ) : (
                <div className="mx-2 mb-2 border-t border-border-subtle" />
              )}
              <div className="space-y-1">
                {fleetGroup.map((item) => renderNavLink(item, collapsed))}
              </div>
            </div>
          </nav>
        </div>

        <div className="space-y-1.5 border-t border-border-subtle pt-4">
          <Link
            href="/"
            aria-label={collapsed ? 'Lihat Situs Publik' : undefined}
            title={collapsed ? 'Lihat Situs Publik' : undefined}
            className={`flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-secondary transition-colors hover:bg-[var(--control-ghost-hover)] hover:text-primary ${
              collapsed ? 'justify-center px-0' : 'gap-2.5'
            }`}
          >
            <svg aria-hidden="true" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {!collapsed && <span>Lihat Situs Publik</span>}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            aria-label={collapsed ? 'Keluar dari akun admin' : undefined}
            title={collapsed ? 'Keluar' : undefined}
            className={`flex min-h-10 w-full items-center rounded-lg px-3 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft ${
              collapsed ? 'justify-center px-0' : 'gap-2.5'
            }`}
          >
            <svg aria-hidden="true" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Sticky Admin Topbar (64px) */}
        <header className="sticky top-0 z-40 h-16 border-b border-border-subtle bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] backdrop-blur-md">
          <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              {/* Mobile Sidebar Trigger */}
              <button
                ref={mobileTriggerRef}
                type="button"
                onClick={() => setMobileDrawerPath(pathname)}
                aria-expanded={mobileOpen}
                aria-controls="admin-mobile-drawer"
                aria-label="Buka menu admin"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border-control bg-[var(--control-secondary-bg)] px-3 text-sm font-semibold text-primary hover:border-border-strong lg:hidden"
              >
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
                <span>Menu</span>
              </button>

              {/* Desktop Sidebar Collapse Toggle */}
              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                aria-expanded={!collapsed}
                aria-label={collapsed ? 'Perluas bilah sisi admin' : 'Ciutkan bilah sisi admin'}
                title={collapsed ? 'Perluas bilah sisi' : 'Ciutkan bilah sisi'}
                className="hidden h-9 w-9 items-center justify-center rounded-lg border border-border-control text-secondary transition-colors hover:border-border-strong hover:bg-surface-raised hover:text-primary lg:inline-flex"
              >
                <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M9 4v16" />
                </svg>
              </button>

              <nav aria-label="Breadcrumb admin" className="flex min-w-0 items-center gap-2 text-sm">
                <Link
                  href="/admin"
                  className="hidden text-muted transition-colors hover:text-primary sm:inline"
                >
                  Admin
                </Link>
                <span aria-hidden="true" className="hidden text-muted sm:inline">
                  /
                </span>
                <span className="truncate font-semibold text-primary">
                  {getPageTitle(pathname)}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {userLoading ? (
                <div className="skeleton hidden h-9 w-32 rounded-lg sm:block" />
              ) : (
                user && (
                  <div className="hidden items-center gap-2.5 rounded-lg border border-border-subtle bg-surface-raised px-3 py-1.5 sm:flex">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-text-brand">
                      {getInitials(user.name)}
                    </span>
                    <div className="max-w-36">
                      <p className="truncate text-xs font-semibold text-primary">{user.name}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </header>

        {/* Mobile Admin Drawer (< 1024px) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
            <div
              aria-hidden="true"
              onClick={() => {
                setMobileDrawerPath(null);
                mobileTriggerRef.current?.focus();
              }}
              className="fixed inset-0 z-40 bg-backdrop"
            />
            <div
              id="admin-mobile-drawer"
              ref={mobileDrawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigasi workspace admin"
              className="fixed inset-y-0 left-0 z-50 flex w-[min(280px,calc(100vw-24px))] flex-col justify-between border-r border-border-default bg-surface p-4 shadow-[var(--shadow-lg-val)]"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold tracking-[-0.02em] text-primary">
                      Carry<span className="text-brand">.</span>
                    </span>
                    <span className="status-badge status-brand px-2 py-0.5 text-[11px]">Admin</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileDrawerPath(null);
                      mobileTriggerRef.current?.focus();
                    }}
                    aria-label="Tutup menu admin"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-secondary hover:bg-surface-raised hover:text-primary"
                  >
                    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>

                <div>
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Operasional
                  </p>
                  <div className="space-y-1">
                    {operationalGroup.map((item) => renderNavLink(item, false))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Armada &amp; Data
                  </p>
                  <div className="space-y-1">
                    {fleetGroup.map((item) => renderNavLink(item, false))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-border-subtle pt-4">
                {user && (
                  <div className="px-2 pb-1">
                    <p className="truncate text-sm font-semibold text-primary">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                )}
                <Link
                  href="/"
                  onClick={() => setMobileDrawerPath(null)}
                  className="btn-secondary w-full"
                >
                  Lihat Situs Publik
                </Link>
                <button type="button" onClick={handleLogout} className="btn-danger-soft w-full">
                  Keluar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Main Content */}
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1280px] flex-1 p-4 focus-visible:outline-none sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
