'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Booking {
    id: string;
    customerName: string;
    customerPhone: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: string;
    car: {
        id: string;
        name: string;
        brand: string;
    };
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/bookings');
            const data = await res.json();
            if (Array.isArray(data)) {
                setBookings(data);
            }
        } catch (error) {
            console.error('Gagal mengambil data booking:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login'; // Redirect manual setelah cookie terhapus
        } catch (error) {
            console.error('Gagal logout:', error);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Fungsi untuk handle perubahan status
    const handleStatusChange = async (bookingId: string, newStatus: string) => {
        const res = await fetch(`/api/bookings/${bookingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
            // Refresh tabel setelah status berubah
            fetchBookings();
        } else {
            alert('Gagal mengubah status');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Helper untuk warna badge sesuai DSG.md
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { backgroundColor: '#ffc107', color: '#000' }; // Warning
            case 'CONFIRMED':
                return { backgroundColor: '#4ade80', color: '#000' }; // Success
            case 'CANCELLED':
                return { backgroundColor: '#f87171', color: '#000' }; // Danger
            case 'COMPLETED':
                return { backgroundColor: '#474dec', color: '#fff' }; // Primary
            default:
                return { backgroundColor: '#555', color: '#fff' };
        }
    };

    return (
        <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', color: '#f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>📋 Daftar Booking Masuk</h1>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link
                        href="/cars"
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#313030', color: '#f3f4f6', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #555' }}
                    >
                        ← Lihat Mobil
                    </Link>

                    {/* --- TAMBAHKAN TOMBOL LOGOUT INI --- */}
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f87171', // Warna Danger sesuai DSG
                            color: '#000',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f87171')}
                    >
                        🚪 Logout
                    </button>
                    {/* ------------------------------------ */}
                </div>
            </div>

            {loading ? (
                <p>Memuat data booking...</p>
            ) : bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#313030', borderRadius: '12px' }}>
                    <p style={{ fontSize: '1.2rem', color: '#aaaaaa' }}>Belum ada booking yang masuk. 🎉</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#313030', borderRadius: '12px', overflow: 'hidden' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#1f1f1f', color: '#aaaaaa', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', borderBottom: '1px solid #444444' }}>Nama Mobil</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid #444444' }}>Penyewa</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid #444444' }}>Periode Sewa</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid #444444' }}>Total Harga</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid #444444' }}>Status & Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    style={{ borderBottom: '1px solid #444444', transition: 'background-color 0.2s' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3a3939')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                    <td style={{ padding: '1rem' }}>
                                        <strong style={{ color: '#ffffff' }}>{booking.car.name}</strong>
                                        <br />
                                        <span style={{ fontSize: '0.85rem', color: '#aaaaaa' }}>{booking.car.brand}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ color: '#ffffff' }}>{booking.customerName}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#aaaaaa' }}>{booking.customerPhone}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#d1d5db' }}>
                                        {formatDate(booking.startDate)} <br /> s/d <br /> {formatDate(booking.endDate)}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ color: '#4ade80', fontWeight: 'bold' }}>
                                            Rp {booking.totalPrice.toLocaleString('id-ID')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            {/* Status Badge sesuai DSG */}
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '0.85rem',
                                                fontWeight: 'bold',
                                                ...getStatusStyle(booking.status)
                                            }}>
                                                {booking.status}
                                            </span>

                                            {/* Dropdown untuk Admin mengubah status */}
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid #555',
                                                    backgroundColor: '#1f1f1f',
                                                    color: '#f3f4f6',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="PENDING">PENDING</option>
                                                <option value="CONFIRMED">CONFIRMED</option>
                                                <option value="COMPLETED">COMPLETED</option>
                                                <option value="CANCELLED">CANCELLED</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}