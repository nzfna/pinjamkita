import { sql } from '@/lib/db';
import { apiUser, json } from '@/lib/auth';
import { rp, tgl } from '@/lib/utils';
import { waLink } from '@/lib/whatsapp';

// Ajukan peminjaman dari isi keranjang
export async function POST() {
  const u = await apiUser();
  if (!u?.wa_verified) return json({ error: 'Verifikasi nomor WhatsApp dulu.' }, 401);
  const o = await sql`
    insert into orders (user_id, start_date, end_date, rent_total, deposit_total)
    select ${u.id}, min(c.start_date), max(c.start_date + c.days), sum(i.price_per_day * c.days), sum(i.deposit)
    from cart_items c join items i on i.id = c.item_id
    where c.user_id = ${u.id} and i.available having count(*) > 0 returning id`;
  if (!o.length) return json({ error: 'Keranjang kosong.' }, 400);
  const id = o[0].id;
  await sql`insert into order_items (order_id, item_id, days, price)
            select ${id}, c.item_id, c.days, i.price_per_day from cart_items c join items i on i.id = c.item_id
            where c.user_id = ${u.id} and i.available`;
  await sql`delete from cart_items where user_id = ${u.id}`;
  const [o2] = await sql`select start_date::text as s, rent_total, deposit_total from orders where id = ${id}`;
  const its = await sql`select i.name, oi.days from order_items oi join items i on i.id = oi.item_id where oi.order_id = ${id}`;
  const text = `Halo admin PinjamKita, saya ${u.name} mengajukan peminjaman #${id}:\n${its.map((i) => `- ${i.name} (${i.days} hari)`).join('\n')}\nMulai: ${tgl(o2.s)}\nSewa ${rp(o2.rent_total)} + deposit ${rp(o2.deposit_total)}.\nMohon dicek ketersediaannya.`;
  return json({ id, waUrl: waLink(text) });
}
