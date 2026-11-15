import { sql } from '@/lib/db';
import { apiUser, json } from '@/lib/auth';

const list = (uid: number) => sql`
  select c.item_id, c.start_date::text as start_date, c.days, i.name, i.category, i.price_per_day, i.deposit
  from cart_items c join items i on i.id = c.item_id where c.user_id = ${uid} order by c.added_at`;

export async function GET() {
  const u = await apiUser();
  return json({ items: u ? await list(u.id) : [] });
}
export async function POST(req: Request) {
  const u = await apiUser();
  if (!u) return json({ error: 'Belum login.' }, 401);
  const { itemId } = await req.json().catch(() => ({}));
  const it = await sql`select 1 from items where id = ${itemId} and available`;
  if (!it.length) return json({ error: 'Barang belum tersedia.' }, 400);
  await sql`insert into cart_items (user_id, item_id, start_date, days) values (${u.id}, ${itemId}, current_date + 1, 1) on conflict do nothing`;
  return json({ items: await list(u.id) });
}
export async function PATCH(req: Request) {
  const u = await apiUser();
  if (!u) return json({ error: 'Belum login.' }, 401);
  const b = await req.json().catch(() => ({}));
  const days = Math.min(30, Math.max(1, Number(b.days) || 1));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(b.startDate))) return json({ error: 'Tanggal tidak valid.' }, 400);
  await sql`update cart_items set days = ${days}, start_date = ${b.startDate}::date where user_id = ${u.id} and item_id = ${b.itemId}`;
  return json({ items: await list(u.id) });
}
export async function DELETE(req: Request) {
  const u = await apiUser();
  if (!u) return json({ error: 'Belum login.' }, 401);
  const itemId = Number(new URL(req.url).searchParams.get('itemId'));
  await sql`delete from cart_items where user_id = ${u.id} and item_id = ${itemId}`;
  return json({ items: await list(u.id) });
}
