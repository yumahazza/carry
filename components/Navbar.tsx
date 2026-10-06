'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') return;
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {}
    };
    fetchUser();
  }, [pathname]);

  const linkClass = (href: string) => 
    `text-sm font-medium transition-colors ${
      pathname === href ? 'text-white' : 'text-[#aaaaaa] hover:text-white'
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#141414]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Carry<span className="text-[#474dec]">.</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className={linkClass('/')}>Home</Link>
          <Link href="/cars" className={linkClass('/cars')}>Fleet</Link>
          
          {user ? (
            <>
              {user.role === 'ADMIN' ? (
                <Link href="/admin" className={linkClass('/admin')}>Dashboard</Link>
              ) : (
                <Link href="/my-bookings" className={linkClass('/my-bookings')}>My Trips</Link>
              )}
              <div className="h-4 w-px bg-white/10"></div>
              <span className="text-sm text-[#aaaaaa]">Hi, <span className="text-white font-medium">{user.name.split(' ')[0]}</span></span>
              <button 
                onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; }}
                className="text-sm font-medium text-[#aaaaaa] hover:text-[#f87171] transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass('/login')}>Sign in</Link>
              <Link 
                href="/register" 
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}