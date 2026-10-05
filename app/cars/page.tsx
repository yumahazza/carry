'use client';
import { useEffect, useState } from 'react';
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

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch('/api/cars');
        if (!res.ok) throw new Error('Gagal mengambil data');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCars(data);
        } else {
          setError('Format data tidak valid');
        }
      } catch (err) {
        console.error('Error fetch cars:', err);
        setError('Terjadi kesalahan saat memuat daftar mobil.');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  return (
    <main
      style={{
        padding: '2rem 1rem',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'sans-serif',
        color: '#f3f4f6',
        minHeight: 'calc(100vh - 80px)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>🚗 Daftar Mobil Sewa</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#aaaaaa', fontSize: '0.95rem' }}>
          Pilih mobil impian Anda. Harga sudah termasuk asuransi dasar.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaaaaa' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          Memuat daftar mobil...
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: '#313030',
            border: '1px solid #f87171',
            borderRadius: '12px',
            color: '#f87171',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && cars.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: '#313030',
            borderRadius: '12px',
            border: '1px dashed #555',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚙</div>
          <p style={{ fontSize: '1.1rem', color: '#aaaaaa' }}>
            Belum ada mobil yang tersedia saat ini.
          </p>
        </div>
      )}

      {/* Grid Mobil */}
      {!loading && !error && cars.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {cars.map((car) => (
            <Link
              key={car.id}
              href={`/cars/${car.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  backgroundColor: '#313030',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #444444',
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = '#474dec';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(71, 77, 236, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#444444';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Gambar Mobil */}
                <div
                  style={{
                    height: '160px',
                    backgroundColor: '#444444',
                    backgroundImage: car.image
                      ? `url(${car.image})`
                      : 'linear-gradient(135deg, #474dec 0%, #313030 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                  }}
                >
                  {!car.image && '🚗'}
                </div>

                {/* Info Card */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.15rem', color: '#f3f4f6' }}>
                    {car.name}
                  </h3>
                  <p style={{ margin: '0 0 1rem', color: '#aaaaaa', fontSize: '0.85rem' }}>
                    {car.brand} • {car.year}
                  </p>

                  <div
                    style={{
                      marginTop: 'auto',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid #444444',
                    }}
                  >
                    <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1rem' }}>
                      Rp {car.pricePerDay.toLocaleString('id-ID')}
                      <span style={{ fontSize: '0.75rem', color: '#aaaaaa', fontWeight: 'normal' }}>
                        {' '}/ hari
                      </span>
                    </span>
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        backgroundColor: car.isAvailable ? '#4ade80' : '#f87171',
                        color: car.isAvailable ? '#000' : '#fff',
                      }}
                    >
                      {car.isAvailable ? '✅ Tersedia' : '❌ Disewa'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}