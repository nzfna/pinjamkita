import { sql } from '@/lib/db';
import { apiUser, json } from '@/lib/auth';

// Toggle: tambah jika belum ada, hapus jika sudah ada
export async function POST(req: Request) {
  const u = await apiUser();
  if (!u) return json({ error: 'Belum login.' }, 401);
  const { itemId, kind } = await req.json().catch(() => ({}));
  if (!['favorit', 'tersimpan', 'waitlist'].includes(kind) || !Number.isInteger(itemId)) return json({ error: 'Data tidak valid.' }, 400);
  const del = await sql`delete from collections where user_id = ${u.id} and item_id = ${itemId} and kind = ${kind} returning 1`;
  if (!del.length) await sql`insert into collections (user_id, item_id, kind) values (${u.id}, ${itemId}, ${kind}) on conflict do nothing`;
  return json({ on: !del.length });
}
