'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalCars: number;
  availableCars: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Gagal fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <main style={{padding: '2rem', color: '#f3f4f6', textAlign: 'center'}}>Memuat dashboard...</main>;
  if (!stats) return <main style={{padding: '2rem', color: '#f87171', textAlign: 'center'}}>Gagal memuat statistik. Pastikan kamu login sebagai Admin.</main>;

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', color: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>📊 Dashboard Admin</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#aaaaaa', fontSize: '0.9rem' }}>Pantau performa rental Carry secara real-time.</p>
        </div>
        <Link 
          href="/bookings" 
          style={{ padding: '0.6rem 1.2rem', backgroundColor: '#474dec', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}
        >
          Lihat Daftar Booking →
        </Link>
      </div>

      {/* Grid Statistik */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        {/* Card 1: Total Mobil */}
        <div style={{ backgroundColor: '#313030', padding: '1.5rem', borderRadius: '12px', border: '1px solid #444444' }}>
          <p style={{ color: '#aaaaaa', margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Total Armada Mobil</p>
          <h2 style={{ margin: 0, fontSize: '2.2rem', color: '#f3f4f6' }}>{stats.totalCars}</h2>
        </div>

        {/* Card 2: Mobil Tersedia */}
        <div style={{ backgroundColor: '#313030', padding: '1.5rem', borderRadius: '12px', border: '1px solid #444444' }}>
          <p style={{ color: '#aaaaaa', margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Mobil Tersedia</p>
          <h2 style={{ margin: 0, fontSize: '2.2rem', color: '#4ade80' }}>{stats.availableCars}</h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#aaaaaa' }}>
            Siap untuk disewakan
          </p>
        </div>

        {/* Card 3: Total Booking */}
        <div style={{ backgroundColor: '#313030', padding: '1.5rem', borderRadius: '12px', border: '1px solid #444444' }}>
          <p style={{ color: '#aaaaaa', margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Total Booking Masuk</p>
          <h2 style={{ margin: 0, fontSize: '2.2rem', color: '#f3f4f6' }}>{stats.totalBookings}</h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#aaaaaa' }}>
            <span style={{color: '#ffc107', fontWeight: 'bold'}}>⏳ {stats.pendingBookings}</span> Pending &nbsp;|&nbsp; 
            <span style={{color: '#4ade80', fontWeight: 'bold'}}>✅ {stats.confirmedBookings}</span> Confirmed
          </p>
        </div>

        {/* Card 4: Pendapatan */}
        <div style={{ backgroundColor: '#313030', padding: '1.5rem', borderRadius: '12px', border: '1px solid #444444' }}>
          <p style={{ color: '#aaaaaa', margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Estimasi Pendapatan</p>
          <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#474dec' }}>
            Rp {stats.totalRevenue.toLocaleString('id-ID')}
          </h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#aaaaaa' }}>
            (Akumulasi dari status Confirmed & Completed)
          </p>
        </div>

      </div>
    </main>
  );
}