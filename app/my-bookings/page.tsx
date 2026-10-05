'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MyBooking {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  car: {
    name: string;
    brand: string;
    image: string;
    pricePerDay: number;
  };
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBookings = async () => {
    try {
      const res = await fetch('/api/my-bookings', {
        credentials: 'include',
      });
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

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Gagal logout:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // ✅ FUNGSI INI HARUS ADA DI DALAM KOMPONEN
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { backgroundColor: '#ffc107', color: '#000' };
      case 'CONFIRMED':
        return { backgroundColor: '#4ade80', color: '#000' };
      case 'CANCELLED':
        return { backgroundColor: '#f87171', color: '#000' };
      case 'COMPLETED':
        return { backgroundColor: '#474dec', color: '#fff' };
      default:
        return { backgroundColor: '#555', color: '#fff' };
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#1f1f1f',
        padding: '2rem 1rem',
        fontFamily: 'sans-serif',
        color: '#f3f4f6',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header & Navigasi */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>📅 Booking Saya</h1>
            <p style={{ margin: '0.5rem 0 0', color: '#aaaaaa', fontSize: '0.9rem' }}>
              Pantau status penyewaan mobil Anda di sini.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link
              href="/"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#313030',
                color: '#f3f4f6',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                border: '1px solid #555',
              }}
            >
              🏠 Beranda
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f87171',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Konten Utama */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#aaaaaa', marginTop: '3rem' }}>
            Memuat riwayat booking...
          </p>
        ) : bookings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: '#313030',
              borderRadius: '12px',
              border: '1px dashed #555',
            }}
          >
            <h2 style={{ color: '#f3f4f6', marginBottom: '1rem' }}>Belum ada booking 🚗</h2>
            <p style={{ color: '#aaaaaa', marginBottom: '1.5rem' }}>
              Anda belum menyewa mobil apapun. Yuk cari mobil impian Anda!
            </p>
            <Link
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#474dec',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
              }}
            >
              Lihat Daftar Mobil
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {bookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  backgroundColor: '#313030',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #444444',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Gambar Mobil */}
                <div
                  style={{
                    height: '180px',
                    backgroundColor: '#444444',
                    backgroundImage: `url(${
                      booking.car.image || 'https://via.placeholder.com/400x200?text=Carry+Rental'
                    })`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>

                {/* Info Card */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f3f4f6' }}>
                        {booking.car.name}
                      </h3>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#aaaaaa' }}>
                        {booking.car.brand}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        ...getStatusStyle(booking.status),
                      }}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div
                    style={{
                      marginBottom: '1.5rem',
                      fontSize: '0.9rem',
                      color: '#d1d5db',
                      lineHeight: '1.6',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>📅 Mulai:</span>
                      <strong style={{ color: '#f3f4f6' }}>{formatDate(booking.startDate)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span> Selesai:</span>
                      <strong style={{ color: '#f3f4f6' }}>{formatDate(booking.endDate)}</strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #444444',
                      }}
                    >
                      <span>💰 Total Harga:</span>
                      <strong style={{ color: '#4ade80', fontSize: '1.1rem' }}>
                        Rp {booking.totalPrice.toLocaleString('id-ID')}
                      </strong>
                    </div>
                  </div>

                  {/* Aksi */}
                  <div style={{ marginTop: 'auto' }}>
                    {booking.status === 'PENDING' && (
                      <button
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #f87171',
                          color: '#f87171',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }}
                      >
                        Batalkan Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}