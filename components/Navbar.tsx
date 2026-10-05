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

  // SEMUA HOOKS DIPANGGIL DI SINI (sebelum conditional return)
  useEffect(() => {
    // Jangan fetch user kalau di halaman login/register
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

  // JANGAN tampilkan Navbar di halaman login/register
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

  // Helper untuk style link aktif
  const linkStyle = (href: string) => ({
    color: pathname === href ? '#474dec' : '#d1d5db',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: pathname === href ? 'bold' : '500',
    transition: 'color 0.2s',
  });

  return (
    <nav
      style={{
        backgroundColor: '#313030',
        borderBottom: '1px solid #444444',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Logo / Brand */}
        <Link
          href="/"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#474dec' }}>🚗</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f3f4f6' }}>
            Carry Rental
          </span>
        </Link>

        {/* Menu Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {loading ? (
            <span style={{ color: '#aaaaaa', fontSize: '0.9rem' }}>Memuat...</span>
          ) : (
            <>
              {/* 🌟 LINK PUBLIK: Selalu muncul untuk semua orang (guest, customer, admin) */}
              <Link href="/" style={linkStyle('/')}>
                Beranda
              </Link>
              <Link href="/cars" style={linkStyle('/cars')}>
                🚗 Daftar Mobil
              </Link>

              {/* 🔐 LINK BERDASARKAN STATUS LOGIN & ROLE */}
              {user ? (
                <>
                  <span
                    style={{
                      color: '#aaaaaa',
                      fontSize: '0.9rem',
                      paddingLeft: '0.5rem',
                      borderLeft: '1px solid #444444',
                    }}
                  >
                    Halo, <strong style={{ color: '#f3f4f6' }}>{user.name}</strong>
                  </span>

                  {user.role === 'ADMIN' ? (
                    <>
                      <Link href="/admin" style={linkStyle('/admin')}>
                        📊 Dashboard
                      </Link>
                      <Link href="/bookings" style={linkStyle('/bookings')}>
                        📋 Booking Masuk
                      </Link>
                    </>
                  ) : (
                    <Link href="/my-bookings" style={linkStyle('/my-bookings')}>
                      📅 Booking Saya
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '0.4rem 1rem',
                      backgroundColor: 'transparent',
                      border: '1px solid #f87171',
                      color: '#f87171',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f87171';
                      e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#f87171';
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" style={linkStyle('/login')}>
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    style={{
                      padding: '0.4rem 1rem',
                      backgroundColor: '#474dec',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}