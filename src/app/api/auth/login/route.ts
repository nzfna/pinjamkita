import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { setSession, json } from '@/lib/auth';
import { normWa } from '@/lib/utils';

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const wa = normWa(String(b.wa || ''));
  const r = await sql`select id, password_hash, wa_verified from users where wa = ${wa}`;
  const u = r[0];
  if (!u || !u.password_hash || !(await bcrypt.compare(String(b.password || ''), u.password_hash)))
    return json({ error: 'Nomor WhatsApp atau password salah.' }, 401);
  await setSession(u.id);
  return json({ ok: true, verified: u.wa_verified });
}
