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
                credentials: 'include', // PENTING: Agar cookie JWT bisa disimpan browser!
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login gagal');
            }

            // Jika berhasil, redirect ke halaman bookings (Admin area)
            router.push('/bookings');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1f1f1f',
            padding: '1rem',
            fontFamily: 'sans-serif'
        }}>
            <div style={{
                backgroundColor: '#313030',
                padding: '2.5rem',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
                <h1 style={{ color: '#f3f4f6', textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.8rem' }}>
                    Selamat Datang Kembali
                </h1>
                <p style={{ color: '#aaaaaa', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Masuk ke akun Carry Rental Anda
                </p>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(248, 113, 113, 0.1)',
                        border: '1px solid #f87171',
                        color: '#f87171',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #555555',
                                backgroundColor: '#1f1f1f',
                                color: '#f3f4f6',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }}
                            placeholder="admin@carry.com"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #555555',
                                backgroundColor: '#1f1f1f',
                                color: '#f3f4f6',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.85rem',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: loading ? '#3a39e0' : '#474dec',
                            color: '#ffffff',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <p style={{ color: '#aaaaaa', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    Belum punya akun?{' '}
                    <Link href="/register" style={{ color: '#474dec', textDecoration: 'none', fontWeight: 'bold' }}>
                        Daftar di sini
                    </Link>
                </p>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link href="/" style={{ color: '#aaaaaa', textDecoration: 'none', fontSize: '0.85rem' }}>
                        ← Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </main>
    );
}