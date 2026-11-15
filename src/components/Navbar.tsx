'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';

export function Navbar({ user }: { user: { name: string } | null }) {
  const path = usePathname();
  const { items, setOpen } = useCart();
  const link = (href: string, label: string) => (
    <Link href={href} className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold ${path === href ? 'bg-mint text-brand' : 'text-ink/70 hover:text-ink'}`}>{label}</Link>
  );
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <nav className="wrap flex h-14 items-center justify-between gap-2" aria-label="Navigasi utama">
        <div className="flex items-center gap-1 sm:gap-4">
          <Link href="/" className="mr-1 text-lg font-extrabold tracking-tight text-brand">PinjamKita</Link>
          {link('/', 'Home')}
          {link('/pesanan', 'Pesanan')}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button onClick={() => setOpen(true)} aria-label={`Keranjang, ${items.length} barang`} className="relative rounded-xl p-2 hover:bg-mint">
                <ShoppingBag size={22} />
                {items.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">{items.length}</span>}
              </button>
              <Link href="/akun" aria-label="Akun" className="grid size-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">{user.name.charAt(0).toUpperCase()}</Link>
            </>
          ) : (
            <>
              <Link href="/masuk" className="btn-secondary !py-2">Masuk</Link>
              <Link href="/daftar" className="btn-primary hidden !py-2 sm:inline-flex">Daftar</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
