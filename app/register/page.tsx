'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [name, setName] = useState('');
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
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role: 'CUSTOMER' }), // Default register sebagai CUSTOMER
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registrasi gagal');
            }

            // Jika berhasil, redirect ke halaman login
            router.push('/login?registered=true');
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
                    Buat Akun Baru
                </h1>
                <p style={{ color: '#aaaaaa', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Bergabung dengan Carry Rental
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
                        <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nama Lengkap</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                            placeholder="John Doe"
                        />
                    </div>

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
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
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
                            placeholder="Minimal 6 karakter"
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
                        {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
                    </button>
                </form>

                <p style={{ color: '#aaaaaa', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    Sudah punya akun?{' '}
                    <Link href="/login" style={{ color: '#474dec', textDecoration: 'none', fontWeight: 'bold' }}>
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </main>
    );
}