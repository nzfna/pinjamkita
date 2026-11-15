import { NextResponse } from 'next/server';

export async function GET() {
  const base = process.env.APP_URL || 'http://localhost:3000';
  if (!process.env.GOOGLE_CLIENT_ID) return NextResponse.redirect(`${base}/masuk?error=google`);
  const state = crypto.randomUUID();
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: `${base}/api/auth/google/callback`,
    response_type: 'code', scope: 'openid email profile', state, prompt: 'select_account',
  });
  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${p}`);
  res.cookies.set('g_state', state, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 600 });
  return res;
}
