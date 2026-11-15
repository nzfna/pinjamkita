import './globals.css';
import type { Metadata } from 'next';
import { getUser } from '@/lib/auth';
import { CartProvider } from '@/components/CartProvider';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = { title: 'PinjamKita', description: 'Pinjam perlengkapan kegiatan tanpa beli: murah, cepat, dan aman.' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider authed={!!user}>
          <Navbar user={user ? { name: user.name } : null} />
          <main className="wrap pb-20 pt-6">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
