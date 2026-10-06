import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
        {/* Subtle grid background effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
        
        <div className="relative z-10 max-w-4xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-[#aaaaaa]">
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#4ade80]"></span>
            Fleet updated daily
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
            Drive the <br />
            <span className="bg-gradient-to-r from-[#474dec] to-[#818cf8] bg-clip-text text-transparent">extra mile.</span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg text-[#aaaaaa] leading-relaxed">
            Premium car rental, simplified. No hidden fees, no paperwork, no hassle. 
            Just you, the open road, and the perfect ride.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/cars" 
              className="w-full sm:w-auto rounded-md bg-[#474dec] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#3a39e0] hover:shadow-md hover:shadow-[#474dec]/20"
            >
              Explore Fleet
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto rounded-md border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Sign in to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Cars Teaser */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-24">
        <div className="flex items-end justify-between border-b border-white/5 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Popular Choices</h2>
            <p className="mt-1 text-sm text-[#aaaaaa]">Handpicked rides for your next journey.</p>
          </div>
          <Link href="/cars" className="text-sm font-medium text-[#474dec] hover:underline">
            View all →
          </Link>
        </div>
        
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Kita pakai komponen CarCard di bawah */}
          <CarCard name="Toyota Alphard" brand="Toyota" year={2023} price={1500000} available={true} image="https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80" />
          <CarCard name="BMW Series 3" brand="BMW" year={2022} price={1200000} available={false} image="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80" />
          <CarCard name="Honda Civic" brand="Honda" year={2024} price={450000} available={true} image="https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80" />
        </div>
      </section>
    </div>
  );
}

// Komponen CarCard (Bisa dipisah ke file lain nanti)
function CarCard({ name, brand, year, price, available, image }: any) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#1f1f1f] transition-all duration-300 hover:border-[#474dec]/30 hover:bg-[#242424]">
      <div className="aspect-[16/10] overflow-hidden bg-[#141414]">
        <img 
          src={image} 
          alt={name} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <p className="text-sm text-[#aaaaaa]">{brand} • {year}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            available ? 'bg-[#4ade80]/10 text-[#4ade80]' : 'bg-[#f87171]/10 text-[#f87171]'
          }`}>
            {available ? 'Available' : 'Rented'}
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <p className="text-xs text-[#aaaaaa]">Starts from</p>
            <p className="text-xl font-bold text-white">
              Rp {price.toLocaleString()}
              <span className="text-sm font-normal text-[#aaaaaa]">/day</span>
            </p>
          </div>
          <button className="rounded-md bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#474dec]">
            View
          </button>
        </div>
      </div>
    </div>
  );
}