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
  
  // State untuk controlled form (menggantikan FormData)
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    year: '',
    pricePerDay: '',
  });
  
  // State untuk melacak apakah kita sedang mode edit atau tambah
  const [editingId, setEditingId] = useState<string | null>(null);

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

  // Handler saat form di-submit (Bisa untuk Create atau Update)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const data = {
      name: formData.name,
      brand: formData.brand,
      year: parseInt(formData.year),
      pricePerDay: parseInt(formData.pricePerDay),
    };

    try {
      let res;
      if (editingId) {
        // Mode Edit: Kirim PUT request ke endpoint spesifik
        res = await fetch(`/api/cars/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        // Mode Add: Kirim POST request
        res = await fetch('/api/cars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }

      if (res.ok) {
        // Reset form setelah sukses
        setFormData({ name: '', brand: '', year: '', pricePerDay: '' });
        setEditingId(null); // Kembali ke mode tambah
        await fetchCars(); // Refresh daftar mobil
      } else {
        alert('Gagal menyimpan mobil');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler saat tombol Edit diklik
  const handleEdit = (car: Car) => {
    setEditingId(car.id); // Set mode edit
    // Isi form dengan data mobil yang dipilih
    setFormData({
      name: car.name,
      brand: car.brand,
      year: car.year.toString(),
      pricePerDay: car.pricePerDay.toString(),
    });
  };

  // Handler saat tombol Batal diklik
  const handleCancel = () => {
    setEditingId(null); // Kembali ke mode tambah
    setFormData({ name: '', brand: '', year: '', pricePerDay: '' }); // Kosongkan form
  };

  // Handler saat tombol Hapus diklik
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

      {/* ===== FORM TAMBAH / EDIT MOBIL ===== */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          border: '2px solid #ededed',
          borderRadius: '8px',
          // Warna form berubah jadi kuning kalau lagi mode edit
          backgroundColor: '#2a2a2a', 
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          {editingId ? '✏️ Edit Mobil' : '➕ Tambah Mobil Baru'}
        </h2>
        
        {/* Input sekarang menggunakan value dan onChange (Controlled) */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Nama Mobil:</label><br />
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required 
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} 
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Merk:</label><br />
          <input 
            type="text" 
            value={formData.brand}
            onChange={(e) => setFormData({...formData, brand: e.target.value})}
            required 
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} 
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Tahun:</label><br />
          <input 
            type="number" 
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
            required 
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} 
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Harga per Hari (Rp):</label><br />
          <input 
            type="number" 
            value={formData.pricePerDay}
            onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
            required 
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} 
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: editingId ? '#ffc107' : '#2539f0',
              color: editingId ? '#000' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            {submitting ? 'Menyimpan...' : (editingId ? 'Update Mobil' : 'Tambah Mobil')}
          </button>

          {/* Tombol Batal cuma muncul kalau lagi mode edit */}
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#db2d2d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* ===== DAFTAR MOBIL ===== */}
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
                backgroundColor: '#2a2a2a',
              }}
            >
              <strong style={{ fontSize: '1.2rem' }}>
                {car.name} ({car.brand})
              </strong>
              <br />
              Tahun: {car.year}
              <br />
              Harga: Rp {car.pricePerDay.toLocaleString('id-ID')} / hari
              <br />
              Status:{' '}
              {car.isAvailable ? (
                <span style={{ color: 'green' }}>✅ Tersedia</span>
              ) : (
                <span style={{ color: 'red' }}>❌ Tidak Tersedia</span>
              )}
              <br />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(car)}
                  style={{
                    padding: '0.3rem 0.8rem',
                    backgroundColor: '#ffc107',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(car.id)}
                  style={{
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}