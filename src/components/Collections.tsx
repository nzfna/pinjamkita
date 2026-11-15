'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ItemCard, type Item } from './ItemCard';
import { Empty } from './ui';

type Row = Item & { kinds: string[] };
const TABS = [
  ['favorit', 'Favorit', 'Belum ada favorit', 'Tekan ikon hati pada barang yang kamu suka.'],
  ['tersimpan', 'Tersimpan', 'Belum ada barang tersimpan', 'Simpan barang untuk dilihat lagi nanti.'],
  ['waitlist', 'Waiting List', 'Waiting list kosong', 'Barang yang sedang dipinjam bisa kamu masukkan ke sini.'],
] as const;

export function Collections({ rows }: { rows: Row[] }) {
  const [tab, setTab] = useState<string>('favorit');
  const t = TABS.find((x) => x[0] === tab)!;
  const list = rows.filter((r) => r.kinds.includes(tab));
  return (
    <section className="space-y-4" aria-label="Koleksi">
      <div role="tablist" className="flex gap-1 rounded-xl bg-mint p-1">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${tab === k ? 'bg-white text-brand shadow-sm' : 'text-ink/60'}`}>
            {label} <span className="text-xs">({rows.filter((r) => r.kinds.includes(k)).length})</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <Empty title={t[2]} hint={t[3]}><Link href="/" className="btn-secondary mt-2">Cari barang</Link></Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => <ItemCard key={`${tab}-${r.id}`} item={r} initial={r.kinds} authed />)}
        </div>
      )}
    </section>
  );
}
