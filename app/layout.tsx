import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from '@/components/Navbar';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Carry Rental',
  description: 'Sewa mobil mudah, cepat, dan terpercaya.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0, backgroundColor: '#1f1f1f', color: '#f3f4f6' }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}