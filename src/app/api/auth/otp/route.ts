import { sql } from '@/lib/db';
import { apiUser, json } from '@/lib/auth';
import { normWa, validWa } from '@/lib/utils';
import { sendWa } from '@/lib/whatsapp';

export async function POST(req: Request) {
  const u = await apiUser();
  if (!u) return json({ error: 'Belum login.' }, 401);
  const b = await req.json().catch(() => ({}));
  const wa = normWa(String(b.wa || ''));
  if (!validWa(wa)) return json({ error: 'Nomor WhatsApp belum benar.' }, 400);
  const dup = await sql`select 1 from users where wa = ${wa} and id <> ${u.id}`;
  if (dup.length) return json({ error: 'Nomor ini sudah dipakai akun lain.' }, 409);
  if (wa !== u.wa) await sql`update users set wa = ${wa}, wa_verified = false where id = ${u.id}`;
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await sql`insert into otps (user_id, wa, code, expires_at) values (${u.id}, ${wa}, ${code}, now() + interval '10 minutes')
            on conflict (user_id) do update set wa = ${wa}, code = ${code}, expires_at = now() + interval '10 minutes'`;
  const sent = await sendWa(wa, `Kode verifikasi PinjamKita: ${code}. Berlaku 10 menit.`);
  const dev = process.env.WA_DEV_MODE === 'true';
  if (!sent && !dev) return json({ error: 'Kode belum bisa dikirim. Coba lagi nanti.' }, 502);
  return json({ ok: true, devCode: !sent && dev ? code : undefined });
}
