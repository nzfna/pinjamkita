'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Bookmark, MapPin, ShoppingBag, Bell } from 'lucide-react';
import { rp } from '@/lib/utils';
import { useCart } from './CartProvider';
import { CatIcon, post } from './ui';

export type Item = { id: number; name: string; category: string; location: string; price_per_day: number; deposit: number; available: boolean; stock: number; sisa_now?: number; description?: string };

export function useCollect(itemId: number, initial: string[], authed: boolean) {
  const router = useRouter();
  const [on, setOn] = useState(new Set(initial));
  async function toggle(kind: string) {
    if (!authed) return router.push('/masuk');
    const r = await post('/api/collections', { itemId, kind });
    if (r.ok) setOn((s) => { const n = new Set(s); r.data.on ? n.add(kind) : n.delete(kind); return n; });
  }
  return { on, toggle };
}

export function ItemActions({ item, initial, authed }: { item: Item; initial: string[]; authed: boolean }) {
  const { on, toggle } = useCollect(item.id, initial, authed);
  const { add } = useCart();
  return (
    <div className="flex gap-2">
      {item.available ? (
        <button onClick={() => add(item.id)} className="btn-primary flex-1"><ShoppingBag size={16} /> Tambah ke keranjang</button>
      ) : (
        <button onClick={() => toggle('waitlist')} className={`flex-1 ${on.has('waitlist') ? 'btn-primary' : 'btn-secondary'}`}>
          <Bell size={16} /> {on.has('waitlist') ? 'Di waiting list' : 'Masuk waiting list'}
        </button>
      )}
      <button onClick={() => toggle('favorit')} aria-pressed={on.has('favorit')} aria-label="Simpan ke favorit" className="btn-secondary !px-3">
        <Heart size={18} className={on.has('favorit') ? 'fill-brand' : ''} />
      </button>
      <button onClick={() => toggle('tersimpan')} aria-pressed={on.has('tersimpan')} aria-label="Simpan untuk nanti" className="btn-secondary !px-3">
        <Bookmark size={18} className={on.has('tersimpan') ? 'fill-brand' : ''} />
      </button>
    </div>
  );
}

export function ItemCard({ item, initial, authed }: { item: Item; initial: string[]; authed: boolean }) {
  return (
    <article className="card flex flex-col overflow-hidden">
      <Link href={`/barang/${item.id}`} className="grid aspect-[4/3] place-items-center bg-mint text-brand" aria-label={item.name}>
        <CatIcon cat={item.category} className="size-14" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h3 className="font-bold leading-snug">{item.name}</h3>
          <p className="flex items-center gap-1 text-sm text-ink/60"><MapPin size={14} /> {item.location}</p>
          <p className="text-sm"><span className="font-bold text-brand">{rp(item.price_per_day)}</span> <span className="text-ink/60">/ hari</span>
          </p>
          <p className="flex flex-wrap items-center gap-2 text-xs text-ink/60">
            <span>Stok {item.stock} unit</span>
            {item.sisa_now !== undefined && (item.sisa_now <= 0
              ? <span className="badge bg-amber-100 text-amber-800">Dipinjam hari ini</span>
              : <span className="badge bg-mint text-brand-dark">Sisa {item.sisa_now} hari ini</span>)}
          </p>
        </div>
        <div className="mt-auto space-y-2">
          <Link href={`/barang/${item.id}`} className="btn-secondary w-full">Lihat detail</Link>
          <ItemActions item={item} initial={initial} authed={authed} />
        </div>
      </div>
    </article>
  );
}
