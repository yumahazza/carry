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

    // SEMUA HOOKS HARUS DI PANGGIL DI SINI (sebelum conditional return)
    useEffect(() => {
        // Jangan fetch user kalau di halaman login/register (nggak perlu)
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
    }, [pathname]); // Tambahkan pathname sebagai dependency

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

    return (
        <nav style={{
            backgroundColor: '#313030',
            borderBottom: '1px solid #444444',
            padding: '1rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            fontFamily: 'sans-serif'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {/* Logo / Brand */}
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#474dec' }}>🚗</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f3f4f6' }}>Carry Rental</span>
                </Link>

                {/* Menu Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {loading ? (
                        <span style={{ color: '#aaaaaa', fontSize: '0.9rem' }}>Memuat...</span>
                    ) : user ? (
                        <>
                            <span style={{ color: '#aaaaaa', fontSize: '0.9rem' }}>
                                Halo, <strong style={{ color: '#f3f4f6' }}>{user.name}</strong>
                            </span>

                            {/* Link berdasarkan Role */}
                            {user.role === 'ADMIN' ? (
                                <Link href="/bookings" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>
                                    Dashboard Admin
                                </Link>
                            ) : (
                                <Link href="/my-bookings" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>
                                    Booking Saya
                                </Link>
                            )}

                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #f87171',
                                    color: '#f87171',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
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
                            <Link href="/login" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#474dec',
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                Daftar
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}