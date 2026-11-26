import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ui/ToastProvider';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: {
    default: 'Carry: Sewa Mobil Harian Transparan',
    template: '%s | Carry',
  },
  description:
    'Pesan kendaraan sewa harian dengan tarif jelas per hari, armada terawat, dan pemantauan reservasi secara langsung.',
};

const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("carry-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var r=document.documentElement;r.classList.toggle("dark",d);r.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-canvas font-sans text-primary antialiased">
        <ThemeProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
