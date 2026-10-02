'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const MOCK_USER_ID = 'user-123'; // Sama dengan yang di form booking

interface Booking {
    id: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: string;
    car: { name: string; brand: string; };
}

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyBookings = async () => {
            const res = await fetch(`/api/my-bookings?userId=${MOCK_USER_ID}`);
            const data = await res.json();
            if (Array.isArray(data)) setBookings(data);
            setLoading(false);
        };
        fetchMyBookings();
    }, []);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: '#f3f4f6' }}>
            <h1>📜 Riwayat Pemesanan Saya</h1>
            {loading ? <p>Memuat...</p> : bookings.length === 0 ? (
                <p style={{ color: '#aaa' }}>Kamu belum memiliki riwayat booking.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {bookings.map((b) => (
                        <div key={b.id} style={{ padding: '1.5rem', backgroundColor: '#313030', borderRadius: '12px', border: '1px solid #444' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <strong style={{ fontSize: '1.2rem' }}>{b.car.name} <span style={{ color: '#aaa', fontWeight: 'normal' }}>({b.car.brand})</span></strong>
                                <span style={{
                                    padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 'bold',
                                    backgroundColor: b.status === 'COMPLETED' ? '#4ade80' : b.status === 'CONFIRMED' ? '#474dec' : '#ffc107',
                                    color: b.status === 'PENDING' ? '#000' : '#fff'
                                }}>
                                    {b.status}
                                </span>
                            </div>
                            <div style={{ color: '#d1d5db', fontSize: '0.95rem' }}>
                                <div>📅 {formatDate(b.startDate)} s/d {formatDate(b.endDate)}</div>
                                <div style={{ marginTop: '0.5rem', color: '#4ade80', fontWeight: 'bold' }}>Total: Rp {b.totalPrice.toLocaleString('id-ID')}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Link href="/cars" style={{ marginTop: '2rem', display: 'inline-block', color: '#474dec' }}>← Kembali ke Daftar Mobil</Link>
        </main>
    );
}