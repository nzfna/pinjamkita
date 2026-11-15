import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { setSession, json } from '@/lib/auth';
import { normWa, validWa } from '@/lib/utils';

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim().toLowerCase();
  const wa = normWa(String(b.wa || ''));
  const password = String(b.password || '');
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Nama atau email belum benar.' }, 400);
  if (!validWa(wa)) return json({ error: 'Nomor WhatsApp belum benar. Contoh: 081234567890.' }, 400);
  if (password.length < 8) return json({ error: 'Password minimal 8 karakter.' }, 400);
  if (b.password !== b.confirm) return json({ error: 'Konfirmasi password tidak sama.' }, 400);
  if (!b.terms) return json({ error: 'Setujui syarat dan ketentuan dulu.' }, 400);
  const dup = await sql`select 1 from users where email = ${email} or wa = ${wa}`;
  if (dup.length) return json({ error: 'Email atau nomor WhatsApp sudah terdaftar.' }, 409);
  const hash = await bcrypt.hash(password, 10);
  const r = await sql`insert into users (name, email, wa, password_hash) values (${name}, ${email}, ${wa}, ${hash}) returning id`;
  await setSession(r[0].id);
  return json({ ok: true });
}
