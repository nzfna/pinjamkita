import { sql } from '@/lib/db';
import { apiUser, json } from '@/lib/auth';
import { rp, tgl } from '@/lib/utils';
import { waLink } from '@/lib/whatsapp';

// Ajukan peminjaman dari isi keranjang
export async function POST() {
  const u = await apiUser();
  if (!u?.wa_verified) return json({ error: 'Verifikasi nomor WhatsApp dulu.' }, 401);
  const clash = await sql`
    select distinct i.name from cart_items c join items i on i.id = c.item_id
    where c.user_id = ${u.id} and exists (
      select 1 from generate_series(c.start_date, c.start_date + c.days - 1, interval '1 day') g
      where i.stock <= (select count(*) from order_items oi join orders od on od.id = oi.order_id
        where oi.item_id = c.item_id and od.status in ('diajukan', 'bisa_dipinjam', 'dipinjam')
        and g::date >= oi.start_date and g::date < oi.start_date + oi.days))`;
  if (clash.length) return json({ error: `${clash.map((c) => c.name).join(', ')} penuh di tanggal yang dipilih. Ganti tanggal di keranjang.` }, 409);
  const o = await sql`
    insert into orders (user_id, start_date, end_date, rent_total, deposit_total)
    select ${u.id}, min(c.start_date), max(c.start_date + c.days), sum(i.price_per_day * c.days), sum(i.deposit)
    from cart_items c join items i on i.id = c.item_id
    where c.user_id = ${u.id} and i.available having count(*) > 0 returning id`;
  if (!o.length) return json({ error: 'Keranjang kosong.' }, 400);
  const id = o[0].id;
  await sql`insert into order_items (order_id, item_id, days, price, start_date)
            select ${id}, c.item_id, c.days, i.price_per_day, c.start_date from cart_items c join items i on i.id = c.item_id
            where c.user_id = ${u.id} and i.available`;
  await sql`delete from cart_items where user_id = ${u.id}`;
  const [o2] = await sql`select start_date::text as s, rent_total, deposit_total from orders where id = ${id}`;
  const its = await sql`select i.name, oi.days from order_items oi join items i on i.id = oi.item_id where oi.order_id = ${id}`;
  const text = `Halo admin PinjamKita, saya ${u.name} mengajukan peminjaman #${id}:\n${its.map((i) => `- ${i.name} (${i.days} hari)`).join('\n')}\nMulai: ${tgl(o2.s)}\nSewa ${rp(o2.rent_total)} + deposit ${rp(o2.deposit_total)}.\nMohon dicek ketersediaannya.`;
  return json({ id, waUrl: waLink(text) });
}
