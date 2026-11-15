import { sql } from '@/lib/db';
import { json } from '@/lib/auth';

// Dipakai admin: ubah status dan info pengambilan.
// curl -X PATCH $APP_URL/api/admin/orders/1 -H "x-admin-token: $ADMIN_TOKEN" -H "Content-Type: application/json" \
//   -d '{"status":"bisa_dipinjam","pickup_address":"Sekretariat BEM","pickup_note":"Jumat 14.00","pickup_lat":-7.952,"pickup_lng":112.614}'
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.ADMIN_TOKEN || req.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN) return json({ error: 'Tidak diizinkan.' }, 403);
  const { id } = await params;
  const b = await req.json().catch(() => ({}));
  if (b.status && !['diajukan', 'bisa_dipinjam', 'dipinjam', 'dikembalikan'].includes(b.status)) return json({ error: 'Status tidak valid.' }, 400);
  const r = await sql`update orders set
      status = coalesce(${b.status ?? null}, status),
      pickup_address = coalesce(${b.pickup_address ?? null}, pickup_address),
      pickup_note = coalesce(${b.pickup_note ?? null}, pickup_note),
      pickup_lat = coalesce(${b.pickup_lat ?? null}::float8, pickup_lat),
      pickup_lng = coalesce(${b.pickup_lng ?? null}::float8, pickup_lng),
      return_note = coalesce(${b.return_note ?? null}, return_note)
    where id = ${Number(id)} returning id, status`;
  return r.length ? json(r[0]) : json({ error: 'Pesanan tidak ditemukan.' }, 404);
}
