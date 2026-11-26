import Link from 'next/link';
import { Search, MapPin, ShieldCheck, Wallet, BellRing } from 'lucide-react';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { CATS } from '@/lib/utils';
import { waLink } from '@/lib/whatsapp';
import { ItemCard, type Item } from '@/components/ItemCard';
import { CatIcon, Empty } from '@/components/ui';

type SP = { q?: string; kategori?: string; lokasi?: string };

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const { q = '', kategori = '', lokasi = '' } = await searchParams;
  const user = await getUser();
  const [items, locs, cols] = await Promise.all([
    sql`select items.*, items.stock - (select count(*) from order_items oi join orders o on o.id = oi.order_id where oi.item_id = items.id and o.status in ('diajukan','bisa_dipinjam','dipinjam') and current_date >= oi.start_date and current_date < oi.start_date + oi.days)::int as sisa_now from items where (${q} = '' or name ilike '%' || ${q} || '%') and (${kategori} = '' or category = ${kategori})
        and (${lokasi} = '' or location = ${lokasi}) order by available desc, id`,
    sql`select distinct location from items order by 1`,
    user ? sql`select item_id, kind from collections where user_id = ${user.id}` : Promise.resolve([]),
  ]);
  const titip = waLink('Halo admin PinjamKita, saya ingin menitipkan barang untuk disewakan.');
  const kinds = (id: number) => cols.filter((c) => c.item_id === id).map((c) => c.kind as string);
  const href = (k: string) => `/?${new URLSearchParams({ ...(q && { q }), ...(lokasi && { lokasi }), ...(k && { kategori: k }) })}`;

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-mint px-5 py-10 sm:px-10 sm:py-14">
        <h1 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {user ? `Halo, ${user.name.split(' ')[0]}!` : 'Pinjam alat kegiatan tanpa beli.'}
        </h1>
        <p className="mt-2 max-w-md text-ink/70">{user ? 'Mau pinjam apa untuk kegiatanmu?' : 'Tenda, proyektor, mic, kamera. Murah, cepat, dan aman untuk mahasiswa.'}</p>
        <form action="/" className="mt-6 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-sm sm:flex-row">
          <label className="flex flex-1 items-center gap-2 px-3">
            <Search size={18} className="text-ink/50" aria-hidden />
            <input name="q" defaultValue={q} placeholder="Cari barang" aria-label="Cari barang" className="w-full bg-transparent py-2 text-sm outline-none" />
          </label>
          <label className="flex items-center gap-2 border-ink/10 px-3 sm:border-l">
            <MapPin size={18} className="text-ink/50" aria-hidden />
            <select name="lokasi" defaultValue={lokasi} aria-label="Lokasi" className="w-full bg-transparent py-2 text-sm outline-none">
              <option value="">Semua lokasi</option>
              {locs.map((l) => <option key={l.location} value={l.location}>{l.location}</option>)}
            </select>
          </label>
          {kategori && <input type="hidden" name="kategori" value={kategori} />}
          <button className="btn-primary">Cari barang</button>
        </form>
      </section>

      <section aria-label="Kategori" className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {['', ...CATS].map((k) => (
          <Link key={k} href={href(k)} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${kategori === k ? 'border-brand bg-brand text-white' : 'border-ink/15 bg-white hover:bg-mint'}`}>
            {k && <CatIcon cat={k} className="size-4" />}{k || 'Semua'}
          </Link>
        ))}
      </section>

      <section aria-label="Daftar barang">
        <h2 className="mb-4 text-xl font-bold">{q || kategori || lokasi ? 'Hasil pencarian' : 'Barang populer'}</h2>
        {items.length === 0 ? (
          <Empty title={q || kategori || lokasi ? 'Barang tidak ditemukan' : 'Belum ada barang'} hint={q || kategori || lokasi ? 'Coba kata kunci, kategori, atau lokasi lain.' : 'Stok sedang diisi. Punya barang menganggur? Titipkan dan dapat penghasilan tambahan.'}>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {(q || kategori || lokasi) && <Link href="/" className="btn-secondary">Lihat semua barang</Link>}
              {titip && <a href={titip} target="_blank" rel="noreferrer" className="btn-primary">Titipkan barangmu</a>}
            </div>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((it) => <ItemCard key={it.id} item={it as Item} initial={kinds(it.id)} authed={!!user} />)}
          </div>
        )}
      </section>

      {titip && items.length > 0 && (
        <p className="text-center text-sm text-ink/60">Punya barang menganggur? <a href={titip} target="_blank" rel="noreferrer" className="font-semibold text-brand">Titipkan lewat WhatsApp</a></p>
      )}

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Keamanan">
        {[
          [ShieldCheck, 'Kontak jelas', 'Setiap akun memakai nomor WhatsApp aktif untuk koordinasi serah-terima.'],
          [Wallet, 'Deposit aman', 'Deposit kembali penuh jika barang kembali utuh dan tepat waktu.'],
          [BellRing, 'Pengingat WhatsApp', 'Pengingat H-1 dan hari pengembalian, jadi tidak ada yang lupa.'],
        ].map(([I, t, d]: any) => (
          <div key={t} className="card p-5">
            <I className="mb-3 text-brand" />
            <h3 className="font-bold">{t}</h3>
            <p className="mt-1 text-sm text-ink/60">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
