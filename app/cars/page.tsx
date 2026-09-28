'use client';

import { useEffect, useState } from 'react';

interface Car {
  id: string;
  name: string;
  brand: string;
  year: number;
  pricePerDay: number;
  isAvailable: boolean;
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCars = async () => {
    try {
      const res = await fetch('/api/cars');
      const data = await res.json();
      setCars(data);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get('name') as string,
      brand: formData.get('brand') as string,
      year: parseInt(formData.get('year') as string),
      pricePerDay: parseInt(formData.get('pricePerDay') as string),
    };

    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        form.reset();
        await fetchCars();
      } else {
        alert('Gagal menambah mobil');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== FUNGSI BARU: HAPUS MOBIL =====
  const handleDelete = async (id: string) => {
    if (!confirm('Yakin mau hapus mobil ini?')) return;

    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchCars();
      } else {
        alert('Gagal menghapus mobil');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    }
  };

  if (loading) {
    return <p style={{ padding: '2rem' }}>Loading...</p>;
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🚗 Carry - Rental Mobil</h1>

      {/* Form Tambah Mobil */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          border: '2px solid #333',
          borderRadius: '8px',
        }}
      >
        <h2 style={{ marginTop: 0 }}>➕ Tambah Mobil Baru</h2>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Nama Mobil:</label><br />
          <input type="text" name="name" required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Merk:</label><br />
          <input type="text" name="brand" required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Tahun:</label><br />
          <input type="number" name="year" required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Harga per Hari (Rp):</label><br />
          <input type="number" name="pricePerDay" required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b3ee3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          {submitting ? 'Menyimpan...' : 'Tambah Mobil'}
        </button>
      </form>

      {/* Daftar Mobil */}
      <h2>📋 Daftar Mobil ({cars.length})</h2>

      {cars.length === 0 ? (
        <p>Belum ada mobil di database. Tambahkan lewat form di atas!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {cars.map((car) => (
            <li
              key={car.id}
              style={{
                marginBottom: '1rem',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}
            >
            <strong style={{ fontSize: '1.2rem', color: 'black' }}>
                {car.name} ({car.brand})
            </strong>
            <br />
            <strong style={{ fontSize: '1rem', color: 'black' }}>
                Tahun: {car.year}
            </strong>
            <br />
            <strong style={{ fontSize: '1rem', color: 'black' }}>
                Harga: Rp {car.pricePerDay.toLocaleString('id-ID')} / hari
            </strong>
            <br />
            <strong style={{ fontSize: '1rem', color: 'black' }}>
                Status:{' '}
                {car.isAvailable ? (
                <span style={{ color: 'green' }}>✅ Tersedia</span>
                ) : (
                <span style={{ color: 'red' }}>❌ Tidak Tersedia</span>
                )}
            </strong>
            <br />
            {/* ===== TOMBOL BARU: HAPUS ===== */}
            <button
                onClick={() => handleDelete(car.id)}
                style={{
                    marginTop: '0.5rem',
                    padding: '0.3rem 0.8rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                🗑️ Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}