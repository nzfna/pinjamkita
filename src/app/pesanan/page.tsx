import Link from 'next/link';
import { Check, ExternalLink, MessageCircle } from 'lucide-react';
import { sql } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { rp, tgl, STATUS_STEPS } from '@/lib/utils';
import { waLink } from '@/lib/whatsapp';
import { Collections } from '@/components/Collections';
import { CancelOrder } from '@/components/CancelOrder';
import { Empty, StatusBadge,} from '@/components/ui';

const STEPS = ['Produk diajukan', 'Produk bisa dipinjam', 'Produk dipinjam', 'Produk dikembalikan'];

export default async function Pesanan() {
  const u = await requireUser();
  const [cols, orders] = await Promise.all([
    sql`select i.*, array_agg(c.kind) as kinds from collections c join items i on i.id = c.item_id where c.user_id = ${u.id} group by i.id order by i.id`,
    sql`select o.id, o.status, o.start_date::text, o.end_date::text, o.rent_total, o.deposit_total, o.pickup_address, o.pickup_note,
          o.pickup_lat, o.pickup_lng, o.return_note, o.cancel_reason,
          (select json_agg(json_build_object('name', i.name, 'days', oi.days)) from order_items oi join items i on i.id = oi.item_id where oi.order_id = o.id) as items
        from orders o where o.user_id = ${u.id} order by o.id desc`,
  ]);
  const admin = process.env.ADMIN_WA || '';

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-extrabold tracking-tight">Pesanan</h1>
      <Collections rows={cols as any} />

      <section className="space-y-4" aria-label="Riwayat pemesanan">
        <h2 className="text-xl font-bold">Riwayat pemesanan</h2>
        {orders.length === 0 ? (
          <Empty title="Belum ada pesanan" hint="Pengajuan peminjamanmu akan muncul di sini."><Link href="/" className="btn-primary mt-2">Pilih barang</Link></Empty>
        ) : orders.map((o) => {
          const idx = STATUS_STEPS.indexOf(o.status);
          const names = (o.items as { name: string; days: number }[]).map((i) => `${i.name} (${i.days} hari)`).join(', ');
          const wa = waLink(`Halo admin PinjamKita, saya ${u.name} mengajukan peminjaman #${o.id}: ${names}. Mulai ${tgl(o.start_date)}.`);
          return (
            <article key={o.id} className="card space-y-4 p-5">
              <header className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold">Pesanan #{o.id}</h3><StatusBadge status={o.status} />
              </header>
              <p className="text-sm text-ink/70">{names}</p>
              <p className="text-sm text-ink/60">{tgl(o.start_date)} sampai {tgl(o.end_date)} · Sewa {rp(o.rent_total)} · Deposit {rp(o.deposit_total)}</p>

              {o.status === 'dibatalkan' ? (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-900"><b>Pengajuan dibatalkan.</b><br />Alasan: {o.cancel_reason}</div>
              ) : (
              <ol className="space-y-3">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${i < idx ? 'bg-brand text-white' : i === idx ? 'border-2 border-brand bg-mint text-brand' : 'border border-ink/20 text-ink/30'}`}>
                      {i < idx ? <Check size={14} /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${i > idx ? 'text-ink/40' : ''}`}>{s}</p>
                      {i === idx && i === 0 && <p className="text-sm text-ink/60">Admin mengecek ketersediaan lewat WhatsApp.</p>}
                      {i === idx && i === 1 && (
                        <div className="mt-1 space-y-2 text-sm">
                          <p><b>{o.pickup_address || 'Alamat pengambilan segera diinfokan.'}</b></p>
                          {o.pickup_note && <p className="text-ink/60">{o.pickup_note}</p>}
                          {o.pickup_lat != null && o.pickup_lng != null && (
                            <div className="space-y-1">
                              <iframe title="Peta pengambilan barang" loading="lazy" className="h-44 w-full rounded-xl border border-ink/10"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${o.pickup_lng - 0.004}%2C${o.pickup_lat - 0.0025}%2C${o.pickup_lng + 0.004}%2C${o.pickup_lat + 0.0025}&marker=${o.pickup_lat}%2C${o.pickup_lng}&layer=mapnik`} />
                              <a className="inline-flex items-center gap-1 font-semibold text-brand" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${o.pickup_lat},${o.pickup_lng}`}>Buka di Google Maps <ExternalLink size={14} /></a>
                            </div>
                          )}
                        </div>
                      )}
                      {i === idx && i === 2 && <p className="text-sm text-ink/60">Mulai {tgl(o.start_date)}. Batas kembali <b className="text-ink">{tgl(o.end_date)}</b>.</p>}
                      {i === idx && i === 3 && <p className="text-sm text-ink/60">{o.return_note || 'Admin sedang mengecek kondisi barang.'}</p>}
                    </div>
                  </li>
                ))}
              </ol>
              )}

              {(o.status === 'diajukan' || o.status === 'bisa_dipinjam') && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  {o.status === 'diajukan' && admin && (
                    <a href={wa} target="_blank" rel="noreferrer" className="btn-primary w-full sm:w-auto"><MessageCircle size={16} /> Lanjutkan di WhatsApp</a>
                  )}
                  <CancelOrder id={o.id} />
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
