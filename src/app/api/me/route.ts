import { sql } from '@/lib/db';
import { apiUser, clearSession, json } from '@/lib/auth';
import { normWa, validWa } from '@/lib/utils';

export async function PATCH(req: Request) {
  const u = await apiUser();
  if (!u) return json({ error: 'Belum login.' }, 401);
  const b = await req.json().catch(() => ({}));
  if (typeof b.notify === 'boolean') {
    await sql`update users set notify = ${b.notify} where id = ${u.id}`;
    return json({ ok: true });
  }
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim().toLowerCase();
  const wa = normWa(String(b.wa || ''));
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Nama atau email belum benar.' }, 400);
  if (!validWa(wa)) return json({ error: 'Nomor WhatsApp belum benar.' }, 400);
  const dup = await sql`select 1 from users where (email = ${email} or wa = ${wa}) and id <> ${u.id}`;
  if (dup.length) return json({ error: 'Email atau nomor WhatsApp sudah dipakai akun lain.' }, 409);
  await sql`update users set name = ${name}, email = ${email}, wa = ${wa} where id = ${u.id}`;
  return json({ ok: true });
}
export async function DELETE() {
  const u = await apiUser();
  if (!u) return json({ error: 'Belum login.' }, 401);
  await sql`delete from users where id = ${u.id}`;
  await clearSession();
  return json({ ok: true });
}
