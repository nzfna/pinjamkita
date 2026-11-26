import { sql } from './db';

// Sisa unit per hari untuk 60 hari ke depan. Pesanan aktif: diajukan, bisa_dipinjam, dipinjam.
export async function dailyLeft(itemId: number) {
  return (await sql`
    select to_char(g, 'YYYY-MM-DD') as d, it.stock - count(x.item_id)::int as sisa
    from items it
    cross join generate_series(current_date, current_date + 59, interval '1 day') g
    left join (
      select oi.item_id, oi.start_date, oi.days from order_items oi join orders o on o.id = oi.order_id
      where o.status in ('diajukan', 'bisa_dipinjam', 'dipinjam')
    ) x on x.item_id = it.id and g::date >= x.start_date and g::date < x.start_date + x.days
    where it.id = ${itemId} group by g, it.stock order by g`) as { d: string; sisa: number }[];
}
