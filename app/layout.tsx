import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aura Enterprise Engine',
  description: 'Production-ready enterprise inventory analytics dashboard'
};

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display'
});

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body'
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="bg-slate-950 text-slate-50 antialiased">{children}</body>
    </html>
  );
}