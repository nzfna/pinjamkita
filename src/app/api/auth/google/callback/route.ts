import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { setSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const base = process.env.APP_URL || 'http://localhost:3000';
  const fail = () => NextResponse.redirect(`${base}/masuk?error=google`);
  const code = req.nextUrl.searchParams.get('code');
  if (!code || req.nextUrl.searchParams.get('state') !== req.cookies.get('g_state')?.value) return fail();
  const t = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${base}/api/auth/google/callback`, grant_type: 'authorization_code',
    }),
  }).then((r) => r.json());
  if (!t.access_token) return fail();
  const g = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${t.access_token}` },
  }).then((r) => r.json());
  if (!g.email || !g.email_verified) return fail();
  const email = String(g.email).toLowerCase();
  let r = await sql`select id, wa_verified from users where google_id = ${g.sub} or email = ${email}`;
  if (!r.length) r = await sql`insert into users (name, email, google_id) values (${g.name || email}, ${email}, ${g.sub}) returning id, wa_verified`;
  else await sql`update users set google_id = ${g.sub} where id = ${r[0].id} and google_id is null`;
  await setSession(r[0].id);
  const res = NextResponse.redirect(`${base}${r[0].wa_verified ? '/' : '/verifikasi-wa'}`);
  res.cookies.delete('g_state');
  return res;
}
