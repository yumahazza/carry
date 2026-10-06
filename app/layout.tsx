import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carry - Premium Car Rental",
  description: "Drive the extra mile. Premium car rental, simplified.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#141414] text-[#f3f4f6] antialiased`}>
        {/* Kita pakai bg #141414 (sedikit lebih gelap dari DSG #1f1f1f) untuk kesan lebih premium dan dalam */}
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}