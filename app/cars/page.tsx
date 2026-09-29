'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Car {
  id: string;
  name: string;
  brand: string;
  year: number;
  pricePerDay: number;
  isAvailable: boolean;
}

export default function CarsPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State untuk form tambah/edit
  const [formData, setFormData] = useState({ name: '', brand: '', year: '', pricePerDay: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  // State untuk Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('all');

  // Fungsi fetch dengan handling yang lebih aman
  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterAvailable !== 'all') params.append('available', filterAvailable);

      const queryString = params.toString();
      const url = `/api/cars${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Debug logging
      console.log('Response dari API:', data);
      console.log('Tipe data:', Array.isArray(data) ? 'Array' : typeof data);
      
      // Pastikan data adalah array sebelum di-set
      if (Array.isArray(data)) {
        setCars(data);
      } else {
        console.error('Data bukan array!', data);
        setCars([]);
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCars();
  };

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
        res = await fetch(`/api/cars/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        res = await fetch('/api/cars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }

      if (res.ok) {
        setFormData({ name: '', brand: '', year: '', pricePerDay: '' });
        setEditingId(null);
        await fetchCars();
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

  const handleEdit = (car: Car) => {
    setEditingId(car.id);
    setFormData({
      name: car.name,
      brand: car.brand,
      year: car.year.toString(),
      pricePerDay: car.pricePerDay.toString(),
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', brand: '', year: '', pricePerDay: '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin mau hapus mobil ini?')) return;
    try {
      const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
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

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', width: '100%', color: '#f3f4f6' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>🚗 Carry - Rental Mobil</h1>

      {/* ===== FORM TAMBAH / EDIT MOBIL ===== */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          border: '1px solid #444',
          borderRadius: '12px',
          backgroundColor: '#313030',
        }}
      >
        <h2 style={{ marginTop: 0, color: '#ffffff' }}>{editingId ? '✏️ Edit Mobil' : ' Tambah Mobil Baru'}</h2>
        
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Nama Mobil:</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #555', backgroundColor: '#1f1f1f', color: 'white' }} />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Merk:</label>
          <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} required style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #555', backgroundColor: '#1f1f1f', color: 'white' }} />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Tahun:</label>
            <input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #555', backgroundColor: '#1f1f1f', color: 'white' }} />
          </div>
          <div style={{ flex: 1, marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Harga per Hari (Rp):</label>
            <input type="number" value={formData.pricePerDay} onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} required style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #555', backgroundColor: '#1f1f1f', color: 'white' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button type="submit" disabled={submitting} style={{ padding: '0.6rem 1.2rem', backgroundColor: editingId ? '#ffc107' : '#474dec', color: editingId ? '#000' : 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
            {submitting ? 'Menyimpan...' : (editingId ? 'Update Mobil' : 'Tambah Mobil')}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>
              Batal
            </button>
          )}
        </div>
      </form>

      {/* ===== SEARCH & FILTER BAR ===== */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Cari nama atau merk (misal: Avanza)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 2, padding: '0.6rem', borderRadius: '6px', border: '1px solid #555', minWidth: '200px', backgroundColor: '#1f1f1f', color: 'white' }}
        />
        <select
          value={filterAvailable}
          onChange={(e) => setFilterAvailable(e.target.value)}
          style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #555', minWidth: '150px', backgroundColor: '#1f1f1f', color: 'white' }}
        >
          <option value="all">Semua Status</option>
          <option value="true">✅ Hanya Tersedia</option>
          <option value="false">❌ Hanya Tidak Tersedia</option>
        </select>
        <button
          type="submit"
          style={{ padding: '0.6rem 1.2rem', backgroundColor: '#474dec', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🔍 Cari
        </button>
      </form>

      {/* ===== DAFTAR MOBIL (GRID) ===== */}
      <h2 style={{ marginBottom: '1rem' }}>📋 Daftar Mobil ({cars.length})</h2>
      
      {loading ? (
        <p>Memuat data...</p>
      ) : cars.length === 0 ? (
        <p style={{ color: '#aaa' }}>Tidak ada mobil yang sesuai dengan pencarian/filter kamu.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {cars.map((car) => (
            <li 
              key={car.id} 
              style={{ 
                padding: '1.5rem', 
                border: '1px solid #444',
                borderRadius: '12px',
                backgroundColor: '#313030', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.borderColor = '#474dec';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = '#444';
              }}
            >
              <strong style={{ fontSize: '1.2rem', color: '#ffffff', display: 'block', marginBottom: '0.5rem' }}>
                {car.name} <span style={{ color: '#aaa', fontWeight: 'normal' }}>({car.brand})</span>
              </strong>
              
              <div style={{ fontSize: '0.95rem', color: '#d1d5db', lineHeight: '1.6' }}>
                <div>📅 Tahun: {car.year}</div>
                <div>💰 Harga: <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Rp {car.pricePerDay.toLocaleString('id-ID')}</span> / hari</div>
                <div style={{ marginTop: '0.5rem' }}>
                  Status: {car.isAvailable ? 
                    <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✅ Tersedia</span> : 
                    <span style={{ color: '#f87171', fontWeight: 'bold' }}>❌ Tidak Tersedia</span>
                  }
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #444' }}>
                <button onClick={() => handleEdit(car)} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                <button onClick={() => handleDelete(car.id)} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Hapus</button>
                <button onClick={() => router.push(`/cars/${car.id}`)} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#474dec', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Detail</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}