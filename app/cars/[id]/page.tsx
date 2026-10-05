'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Car {
  id: string;
  name: string;
  brand: string;
  year: number;
  pricePerDay: number;
  isAvailable: boolean;
  image?: string;
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const carId = params.id as string;

  // ✅ SEMUA HOOKS HARUS BERADA DI SINI (DI DALAM FUNGSI)
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk form booking
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState(''); 
  const [loadingBooking, setLoadingBooking] = useState(false);

  // Variabel tanggal hari ini untuk atribut 'min'
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await fetch(`/api/cars/${carId}`);
        if (res.ok) {
          const data = await res.json();
          setCar(data);
        }
      } catch (error) {
        console.error('Gagal mengambil data mobil:', error);
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCar();
    }
  }, [carId]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dateError) {
      alert('Mohon perbaiki tanggal terlebih dahulu.');
      return;
    }

    setLoadingBooking(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId,
          customerName,
          customerPhone,
          startDate,
          endDate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Booking berhasil dibuat! Silakan cek status di "Booking Saya".');
        router.push('/my-bookings');
      } else {
        alert(data.error || 'Gagal membuat booking.');
      }
    } catch (error) {
      console.error('Error booking:', error);
      alert('Terjadi kesalahan saat memproses booking.');
    } finally {
      setLoadingBooking(false);
    }
  };

  if (loading) return <main style={{ padding: '2rem', color: '#f3f4f6', textAlign: 'center' }}>Memuat data mobil...</main>;
  if (!car) return <main style={{ padding: '2rem', color: '#f87171', textAlign: 'center' }}>Mobil tidak ditemukan.</main>;

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', color: '#f3f4f6' }}>
      <Link href="/cars" style={{ color: '#474dec', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
        ← Kembali ke Daftar Mobil
      </Link>

      <div style={{ backgroundColor: '#313030', borderRadius: '12px', padding: '2rem', border: '1px solid #444444' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem' }}>{car.name}</h1>
        <p style={{ color: '#aaaaaa', margin: '0 0 1rem' }}>{car.brand} • {car.year}</p>
        
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80', marginBottom: '1rem' }}>
          Rp {car.pricePerDay.toLocaleString('id-ID')} / hari
        </div>

        <div style={{ 
          display: 'inline-block', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '999px', 
          fontSize: '0.85rem', 
          fontWeight: 'bold',
          backgroundColor: car.isAvailable ? '#4ade80' : '#f87171',
          color: car.isAvailable ? '#000' : '#fff',
          marginBottom: '2rem'
        }}>
          {car.isAvailable ? '✅ Tersedia' : '❌ Tidak Tersedia'}
        </div>

        {car.isAvailable ? (
          <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #444444', paddingTop: '2rem' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem' }}>Form Pemesanan</h2>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>Nama Lengkap</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #555555', backgroundColor: '#1f1f1f', color: '#f3f4f6', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>Nomor Telepon</label>
              <input 
                type="tel" 
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #555555', backgroundColor: '#1f1f1f', color: '#f3f4f6', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>Tanggal Mulai</label>
                <input 
                  type="date" 
                  min={today}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && new Date(e.target.value) >= new Date(endDate)) {
                      setDateError('Tanggal selesai harus lebih akhir dari tanggal mulai.');
                    } else {
                      setDateError('');
                    }
                  }}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #555555', backgroundColor: '#1f1f1f', color: '#f3f4f6', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db' }}>Tanggal Selesai</label>
                <input 
                  type="date" 
                  min={startDate || today}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (startDate && new Date(e.target.value) <= new Date(startDate)) {
                      setDateError('Tanggal selesai harus lebih akhir dari tanggal mulai.');
                    } else {
                      setDateError('');
                    }
                  }}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #555555', backgroundColor: '#1f1f1f', color: '#f3f4f6', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* 🛡️ TAMPILKAN ERROR MESSAGE DI BAWAH INPUT TANGGAL */}
            {dateError && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', margin: '0', fontWeight: 'bold' }}>
                ⚠️ {dateError}
              </p>
            )}

            <button
              type="submit"
              disabled={!!dateError || loadingBooking}
              style={{
                marginTop: '1rem',
                padding: '0.85rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: loadingBooking || dateError ? '#3a39e0' : '#474dec',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loadingBooking || dateError ? 'not-allowed' : 'pointer',
                opacity: loadingBooking || dateError ? 0.5 : 1
              }}
            >
              {loadingBooking ? 'Memproses...' : 'Konfirmasi Booking'}
            </button>
          </form>
        ) : (
          <p style={{ color: '#f87171', marginTop: '2rem', fontWeight: 'bold' }}>
            Maaf, mobil ini sedang tidak tersedia untuk disewa.
          </p>
        )}
      </div>
    </main>
  );
}