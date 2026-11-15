'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, X, ShoppingBag } from 'lucide-react';
import { rp } from '@/lib/utils';
import { CatIcon, Empty, post } from './ui';

type CartItem = { item_id: number; name: string; category: string; price_per_day: number; deposit: number; days: number; start_date: string };
type Ctx = { items: CartItem[]; open: boolean; setOpen: (v: boolean) => void; add: (id: number) => Promise<void> };
const CartCtx = createContext<Ctx>(null!);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ authed, children }: { authed: boolean; children: React.ReactNode }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (authed) fetch('/api/cart').then((r) => r.json()).then((d) => setItems(d.items ?? []));
    else setItems([]);
  }, [authed]);

  const add = useCallback(async (id: number) => {
    if (!authed) return router.push('/masuk');
    const r = await post('/api/cart', { itemId: id });
    if (r.ok) { setItems(r.data.items); setOpen(true); }
  }, [authed, router]);

  async function patch(it: CartItem, days: number, startDate: string) {
    const r = await post('/api/cart', { itemId: it.item_id, days, startDate }, 'PATCH');
    if (r.ok) setItems(r.data.items);
  }
  async function remove(id: number) {
    const r = await post(`/api/cart?itemId=${id}`, undefined, 'DELETE');
    if (r.ok) setItems(r.data.items);
  }
  async function checkout() {
    setBusy(true); setErr('');
    const r = await post('/api/orders');
    setBusy(false);
    if (!r.ok) return setErr(r.data.error || 'Pengajuan gagal.');
    setItems([]); setOpen(false);
    if (r.data.waUrl) window.location.href = r.data.waUrl;
    else { router.push('/pesanan'); router.refresh(); }
  }

  const rent = items.reduce((s, i) => s + i.price_per_day * i.days, 0);
  const dep = items.reduce((s, i) => s + i.deposit, 0);

  return (
    <CartCtx.Provider value={{ items, open, setOpen, add }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-40 bg-ink/30" onClick={() => setOpen(false)}>
          <section
            role="dialog" aria-label="Keranjang" onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 flex max-h-[80vh] min-h-[50vh] flex-col rounded-t-3xl bg-white shadow-xl lg:inset-x-auto lg:bottom-auto lg:right-4 lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:min-h-0 lg:w-[400px] lg:rounded-2xl"
          >
            <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold"><ShoppingBag size={20} className="text-brand" /> Keranjang</h2>
              <button onClick={() => setOpen(false)} aria-label="Tutup" className="rounded-lg p-1 hover:bg-ink/5"><X size={20} /></button>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <Empty title="Keranjang masih kosong" hint="Pilih barang di Home, lalu tambahkan ke keranjang." />
              ) : items.map((it) => (
                <div key={it.item_id} className="flex gap-3 rounded-xl border border-ink/10 p-3">
                  <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-mint text-brand"><CatIcon cat={it.category} className="size-6" /></div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{it.name}</p>
                      <button onClick={() => remove(it.item_id)} aria-label={`Hapus ${it.name}`} className="text-ink/50 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input type="date" value={it.start_date} min={new Date(Date.now() + 864e5).toISOString().slice(0, 10)}
                        onChange={(e) => e.target.value && patch(it, it.days, e.target.value)} className="input !w-auto !px-2 !py-1 text-xs" aria-label="Tanggal mulai" />
                      <div className="flex items-center rounded-lg border border-ink/15">
                        <button onClick={() => patch(it, it.days - 1, it.start_date)} disabled={it.days <= 1} aria-label="Kurangi hari" className="p-1.5 disabled:opacity-30"><Minus size={14} /></button>
                        <span className="min-w-12 text-center text-xs font-semibold">{it.days} hari</span>
                        <button onClick={() => patch(it, it.days + 1, it.start_date)} aria-label="Tambah hari" className="p-1.5"><Plus size={14} /></button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-brand">{rp(it.price_per_day * it.days)}</p>
                  </div>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <footer className="space-y-3 border-t border-ink/10 px-5 py-4">
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between"><dt className="text-ink/60">Biaya sewa</dt><dd>{rp(rent)}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink/60">Deposit (dikembalikan)</dt><dd>{rp(dep)}</dd></div>
                  <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-bold"><dt>Total pembayaran</dt><dd>{rp(rent + dep)}</dd></div>
                </dl>
                {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
                <button onClick={checkout} disabled={busy} className="btn-primary w-full">{busy ? 'Mengajukan...' : 'Lanjutkan pengajuan'}</button>
              </footer>
            )}
          </section>
        </div>
      )}
    </CartCtx.Provider>
  );
}
