import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { rp } from '@/lib/utils';
import { ItemActions, type Item } from '@/components/ItemCard';
import { CatIcon } from '@/components/ui';
import { dailyLeft } from '@/lib/availability';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';

export default async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const [it] = await sql`select * from items where id = ${Number(id)}`;
  if (!it) notFound();
  const user = await getUser();
  const days = await dailyLeft(it.id);
  const cols = user ? await sql`select kind from collections where user_id = ${user.id} and item_id = ${it.id}` : [];
  return (
    <div className="space-y-5">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-brand"><ArrowLeft size={16} /> Kembali</Link>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid aspect-[4/3] place-items-center rounded-3xl bg-mint text-brand"><CatIcon cat={it.category} className="size-24" /></div>
        <div className="space-y-4">
          <span className="badge bg-mint text-brand-dark">{it.category}</span>
          <h1 className="text-3xl font-extrabold tracking-tight">{it.name}</h1>
          <p className="flex items-center gap-1 text-ink/60"><MapPin size={16} /> {it.location}</p>
          <p className="text-ink/80">{it.description}</p>
          <dl className="card divide-y divide-ink/10 text-sm">
            <div className="flex justify-between p-3"><dt className="text-ink/60">Harga sewa</dt><dd className="font-bold text-brand">{rp(it.price_per_day)} / hari</dd></div>
            <div className="flex justify-between p-3"><dt className="text-ink/60">Deposit (dikembalikan)</dt><dd className="font-semibold">{rp(it.deposit)}</dd></div>
            <div className="flex justify-between p-3"><dt className="text-ink/60">Ketersediaan</dt><dd className="font-semibold">Stok {it.stock} unit</dd></div>
          </dl>
          <ItemActions item={it as Item} initial={cols.map((c) => c.kind)} authed={!!user} />
        </div>
      </div>
      <AvailabilityCalendar days={days} stock={it.stock} />
    </div>
  );
}
