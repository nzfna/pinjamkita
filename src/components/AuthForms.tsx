'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Field, post } from './ui';

const Google = () => (
  <a href="/api/auth/google" className="btn-secondary w-full">
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
    Lanjut dengan Google
  </a>
);
const Shell = ({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) => (
  <div className="mx-auto max-w-md space-y-5 py-4">
    <div><h1 className="text-2xl font-extrabold tracking-tight">{title}</h1><p className="text-ink/60">{sub}</p></div>
    <div className="card space-y-4 p-5">{children}</div>
  </div>
);
const Err = ({ m }: { m: string }) => (m ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{m}</p> : null);
const Or = () => <p className="text-center text-xs text-ink/50">atau</p>;

export function LoginForm({ googleError }: { googleError?: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({ wa: '', password: '' });
  const [err, setErr] = useState(googleError ? 'Masuk dengan Google gagal. Coba lagi.' : '');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await post('/api/auth/login', f);
    setBusy(false);
    if (!r.ok) return setErr(r.data.error || 'Gagal masuk.');
    router.push('/'); router.refresh();
  }
  return (
    <Shell title="Masuk" sub="Pakai nomor WhatsApp atau akun Google.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nomor WhatsApp" inputMode="tel" placeholder="081234567890" value={f.wa} onChange={(e) => setF({ ...f, wa: e.target.value })} required />
        <Field label="Password" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
        <Err m={err} />
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Memproses...' : 'Masuk'}</button>
      </form>
      <Or /><Google />
      <p className="text-center text-sm text-ink/60">Belum punya akun? <Link href="/daftar" className="font-semibold text-brand">Daftar</Link></p>
    </Shell>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [f, setF] = useState({ name: '', email: '', wa: '', password: '', confirm: '', terms: false });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: k === 'terms' ? e.target.checked : e.target.value });
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await post('/api/auth/register', f);
    setBusy(false);
    if (!r.ok) return setErr(r.data.error || 'Pendaftaran gagal.');
    router.push('/'); router.refresh();
  }
  return (
    <Shell title="Daftar" sub="Buat akun untuk mulai meminjam barang.">
      <Google /><Or />
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nama" value={f.name} onChange={set('name')} required />
        <Field label="Email" type="email" value={f.email} onChange={set('email')} required />
        <Field label="Nomor WhatsApp" inputMode="tel" placeholder="081234567890" value={f.wa} onChange={set('wa')} required />
        <Field label="Password" type="password" minLength={8} value={f.password} onChange={set('password')} required />
        <Field label="Konfirmasi password" type="password" value={f.confirm} onChange={set('confirm')} required />
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={f.terms} onChange={set('terms')} className="mt-1 accent-brand" /> Saya setuju dengan syarat dan ketentuan PinjamKita.</label>
        <Err m={err} />
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Memproses...' : 'Daftar'}</button>
      </form>
      <p className="text-center text-sm text-ink/60">Sudah punya akun? <Link href="/masuk" className="font-semibold text-brand">Masuk</Link></p>
    </Shell>
  );
}
