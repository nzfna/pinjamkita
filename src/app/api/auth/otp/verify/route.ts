import { sql } from '@/lib/db';
import { apiUser, json } from '@/lib/auth';

export async function POST(req: Request) {
  const u = await apiUser();
  if (!u) return json({ error: 'Belum login.' }, 401);
  const b = await req.json().catch(() => ({}));
  const r = await sql`select 1 from otps where user_id = ${u.id} and wa = ${u.wa} and code = ${String(b.code || '')} and expires_at > now()`;
  if (!r.length) return json({ error: 'Kode salah atau sudah kedaluwarsa.' }, 400);
  await sql`update users set wa_verified = true where id = ${u.id}`;
  await sql`delete from otps where user_id = ${u.id}`;
  return json({ ok: true });
}
