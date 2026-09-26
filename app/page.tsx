// 1. Buat fungsi untuk mengambil data dari API
async function getPesanDariApi() {
  // Fetch ke endpoint API yang tadi kita buat
  const res = await fetch('http://localhost:3000/api/hello');
  const data = await res.json();
  return data;
}

// 2. Jadikan komponen Home sebagai async function
export default async function Home() {
  // Panggil fungsi fetch di atas
  const data = await getPesanDariApi();

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Hello World</h1>
      <p>Carry — Car Rental App</p>
      
      <hr style={{ margin: '20px 0' }} />
      
      <h2>Data dari Backend:</h2>
      {/* 3. Tampilkan data.message yang didapat dari API */}
      <p style={{ color: 'blue', fontWeight: 'bold' }}>
        {data.message}
      </p>
    </main>
  );
}