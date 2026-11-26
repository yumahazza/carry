'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Memisahkan shell publik (Navbar + main + Footer), shell autentikasi (/login, /register),
 * dan workspace Admin (/admin*) tanpa duplikasi landmark <main>.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isAuth = pathname === '/login' || pathname === '/register';

  if (isAdmin) {
    return <>{children}</>;
  }

  if (isAuth) {
    return (
      <>
        <a href="#main-content" className="skip-link">
          Langsung ke konten utama
        </a>
        <main id="main-content" tabIndex={-1} className="min-h-dvh focus-visible:outline-none">
          {children}
        </main>
      </>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" className="skip-link">
        Langsung ke konten utama
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 focus-visible:outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}

