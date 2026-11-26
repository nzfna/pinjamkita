import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sql } from './db';

export type User = { id: number; name: string; email: string; wa: string | null; notify: boolean; reputation: number };

const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-ganti-di-produksi');

export async function setSession(uid: number) {
  const token = await new SignJWT({ uid }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('30d').sign(key());
  (await cookies()).set('pk_session', token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30,
  });
}
export async function clearSession() {
  (await cookies()).delete('pk_session');
}
export async function getUser(): Promise<User | null> {
  const token = (await cookies()).get('pk_session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    const r = await sql`select id, name, email, wa, notify, reputation from users where id = ${payload.uid as number}`;
    return (r[0] as User) ?? null;
  } catch {
    return null;
  }
}
// Untuk halaman: wajib login
export async function requireUser() {
  const u = await getUser();
  if (!u) redirect('/masuk');
  return u;
}
// Untuk API: balas null jika belum login
export const apiUser = getUser;
export const json = (data: unknown, status = 200) => Response.json(data, { status });
