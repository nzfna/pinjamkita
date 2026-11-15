import { sql } from '@/lib/db';
import { apiUser, json } from '@/lib/auth';
import { waLink } from '@/lib/whatsapp';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await apiUser();
  if (!u) return json({ error: 'Belum login.' }, 401);
  const { id } = await params;
  const b = await req.json().catch(() => ({}));
  const reason = String(b.reason || '').trim().slice(0, 300);
  if (reason.length < 5) return json({ error: 'Tulis alasan pembatalan (minimal 5 karakter).' }, 400);
  const r = await sql`update orders set status = 'dibatalkan', cancel_reason = ${reason}
    where id = ${Number(id)} and user_id = ${u.id} and status in ('diajukan', 'bisa_dipinjam') returning id`;
  if (!r.length) return json({ error: 'Pesanan ini sudah tidak bisa dibatalkan.' }, 400);
  return json({ ok: true, waUrl: waLink(`Halo admin PinjamKita, saya ${u.name} membatalkan pengajuan #${id}.\nAlasan: ${reason}`) });
}
