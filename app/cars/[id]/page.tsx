'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Car {
  id: string;
  name: string;
  brand: string;
  year: number;
  pricePerDay: number;
  isAvailable: boolean;
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  // State BARU untuk Form Booking
  const [bookingData, setBookingData] = useState({
    customerName: '',
    customerPhone: '',
    startDate: '',
    endDate: '',
  });
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Fetch Detail Mobil
  useEffect(() => {
    const fetchCarDetail = async () => {
      try {
        const res = await fetch(`/api/cars/${params.id}`);
        if (!res.ok) throw new Error('Mobil tidak ditemukan');
        const data = await res.json();
        setCar(data);
      } catch (error) {
        console.error('Gagal mengambil detail mobil:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCarDetail();
    }
  }, [params.id]);

  // Hitung Estimasi Harga Real-time saat tanggal berubah
  useEffect(() => {
    if (bookingData.startDate && bookingData.endDate && car) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) diffDays = 1; // Minimal 1 hari
      
      setEstimatedPrice(diffDays * car.pricePerDay);
    } else {
      setEstimatedPrice(null);
    }
  }, [bookingData.startDate, bookingData.endDate, car]);

  // Handler Submit Booking
  const MOCK_USER_ID = 'user-123';
  
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    setBookingMessage('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: car?.id,
          userId: MOCK_USER_ID,
          ...bookingData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setBookingMessage('✅ Booking berhasil dibuat! Status: PENDING. Admin akan segera menghubungi Anda.');
        // Reset form
        setBookingData({ customerName: '', customerPhone: '', startDate: '', endDate: '' });
      } else {
        setBookingMessage(`❌ Gagal: ${data.error}`);
      }
    } catch (error) {
      setBookingMessage('❌ Terjadi kesalahan sistem. Coba lagi.');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return <main style={{ padding: '2rem', textAlign: 'center', color: '#f3f4f6' }}><p>Memuat detail mobil...</p></main>;
  }

  if (!car) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center', color: '#f3f4f6' }}>
        <h2>Mobil tidak ditemukan 😢</h2>
        <button onClick={() => router.push('/cars')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#474dec', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Kembali ke Daftar Mobil</button>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', color: '#f3f4f6' }}>
      <button onClick={() => router.push('/cars')} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', backgroundColor: '#313030', color: '#f3f4f6', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer' }}>
        ← Kembali ke Daftar
      </button>

      <div style={{ backgroundColor: '#313030', padding: '2rem', borderRadius: '12px', border: '1px solid #444' }}>
        <h1 style={{ marginTop: 0, fontSize: '2rem', color: '#ffffff' }}>{car.name}</h1>
        <p style={{ fontSize: '1.2rem', color: '#aaa', marginTop: '-1rem' }}>{car.brand}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          <div style={{ backgroundColor: '#1f1f1f', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Tahun Pembuatan</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff' }}>{car.year}</div>
          </div>
          <div style={{ backgroundColor: '#1f1f1f', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Harga Sewa</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>Rp {car.pricePerDay.toLocaleString('id-ID')}</div>
            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>per hari</div>
          </div>
          <div style={{ backgroundColor: '#1f1f1f', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Status</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: car.isAvailable ? '#4ade80' : '#f87171' }}>
              {car.isAvailable ? '✅ Tersedia' : '❌ Disewa'}
            </div>
          </div>
        </div>

        {/* ===== FORM BOOKING (BARU!) ===== */}
        {car.isAvailable ? (
          <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #444' }}>
            <h3 style={{ color: '#ffffff', marginTop: 0 }}>📅 Form Pemesanan</h3>
            <form onSubmit={handleBookingSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Nama Penyewa</label>
                  <input 
                    type="text" 
                    required 
                    value={bookingData.customerName}
                    onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #555', backgroundColor: '#1f1f1f', color: 'white', boxSizing: 'border-box' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>No. HP / WhatsApp</label>
                  <input 
                    type="tel" 
                    required 
                    value={bookingData.customerPhone}
                    onChange={(e) => setBookingData({...bookingData, customerPhone: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #555', backgroundColor: '#1f1f1f', color: 'white', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Tanggal Mulai Sewa</label>
                  <input 
                    type="date" 
                    required 
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #555', backgroundColor: '#1f1f1f', color: 'white', boxSizing: 'border-box' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Tanggal Selesai Sewa</label>
                  <input 
                    type="date" 
                    required 
                    value={bookingData.endDate}
                    onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #555', backgroundColor: '#1f1f1f', color: 'white', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>

              {/* Tampilan Estimasi Harga */}
              {estimatedPrice !== null && (
                <div style={{ backgroundColor: '#1f1f1f', padding: '1rem', borderRadius: '6px', border: '1px solid #474dec', textAlign: 'center' }}>
                  <span style={{ color: '#aaa' }}>Estimasi Total Harga: </span>
                  <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1.2rem' }}>Rp {estimatedPrice.toLocaleString('id-ID')}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isBooking}
                style={{ 
                  width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold',
                  backgroundColor: isBooking ? '#555' : '#474dec', color: 'white', border: 'none', borderRadius: '8px', cursor: isBooking ? 'not-allowed' : 'pointer' 
                }}
              >
                {isBooking ? 'Memproses...' : 'Konfirmasi Booking'}
              </button>

              {bookingMessage && (
                <p style={{ textAlign: 'center', color: bookingMessage.includes('✅') ? '#4ade80' : '#f87171', marginTop: '0.5rem' }}>
                  {bookingMessage}
                </p>
              )}
            </form>
          </div>
        ) : (
          <div style={{ marginTop: '2rem', textAlign: 'center', padding: '1rem', backgroundColor: '#1f1f1f', borderRadius: '8px', color: '#f87171' }}>
            Mobil ini sedang tidak tersedia untuk disewa.
          </div>
        )}
      </div>
    </main>
  );
}