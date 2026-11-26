'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';
import { Dialog, Field, post } from './ui';

type U = { name: string; email: string; wa: string | null; notify: boolean; reputation: number };
const FAQ = [
  ['Bagaimana cara meminjam?', 'Pilih barang, tambahkan ke keranjang, lalu ajukan. Admin mengonfirmasi lewat WhatsApp.'],
  ['Berapa biaya yang harus dibayar?', 'Biaya sewa per hari ditambah deposit. Deposit dikembalikan penuh jika barang utuh dan tepat waktu.'],
  ['Kapan deposit dikembalikan?', 'Setelah admin mencocokkan kondisi barang dengan foto serah-terima.'],
  ['Bagaimana pengambilan barang?', 'Setelah pengajuan disetujui, alamat dan peta pengambilan muncul di halaman Pesanan.'],
  ['Bagaimana jika telat atau barang rusak?', 'Denda atau potongan deposit berlaku sesuai aturan, dan skor reputasi ikut turun.'],
];

export function AccountClient({ user }: { user: U }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ name: user.name, email: user.email, wa: user.wa ?? '' });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [notify, setNotify] = useState(user.notify);
  const [del, setDel] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    const r = await post('/api/me', f, 'PATCH');
    if (!r.ok) return setErr(r.data.error || 'Gagal menyimpan.');
    setEdit(false); setMsg('Perubahan tersimpan.');
    router.push('/akun'); router.refresh();
  }
  async function toggleNotify() {
    const v = !notify; setNotify(v);
    const r = await post('/api/me', { notify: v }, 'PATCH');
    if (!r.ok) setNotify(!v);
  }
  async function logout() { await post('/api/auth/logout'); router.push('/'); router.refresh(); }
  async function remove() { await post('/api/me', undefined, 'DELETE'); router.push('/'); router.refresh(); }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Akun</h1>

      <section className="card space-y-4 p-5" aria-label="Informasi akun">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Informasi akun</h2>
          {!edit && <button onClick={() => { setEdit(true); setMsg(''); }} className="btn-secondary !py-1.5">Ubah informasi</button>}
        </div>
        {edit ? (
          <form onSubmit={save} className="space-y-4">
            <Field label="Nama" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
            <Field label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
            <Field label="Nomor WhatsApp" inputMode="tel" value={f.wa} onChange={(e) => setF({ ...f, wa: e.target.value })} required />
            {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
            <div className="flex gap-2"><button className="btn-primary">Simpan perubahan</button><button type="button" onClick={() => setEdit(false)} className="btn-secondary">Batal</button></div>
          </form>
        ) : (
          <dl className="space-y-2 text-sm">
            {[['Nama', user.name], ['Nomor WhatsApp', `+${user.wa}`], ['Email', user.email], ['Skor reputasi', String(user.reputation)]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4"><dt className="text-ink/60">{k}</dt><dd className="font-semibold">{v}</dd></div>
            ))}
          </dl>
        )}
        {msg && <p role="status" className="text-sm font-semibold text-brand">{msg}</p>}
      </section>

      <section className="card p-5" aria-label="Pengaturan">
        <h2 className="mb-3 text-lg font-bold">Pengaturan</h2>
        <label className="flex items-center justify-between gap-4 text-sm">
          <span><b>Pengingat WhatsApp</b><br /><span className="text-ink/60">Pengingat H-1 dan hari pengembalian.</span></span>
          <input type="checkbox" role="switch" checked={notify} onChange={toggleNotify} className="size-5 accent-brand" />
        </label>
      </section>

      <section className="card p-5" aria-label="Bantuan">
        <h2 className="mb-2 text-lg font-bold">FAQ / Bantuan</h2>
        <div className="divide-y divide-ink/10">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">{q}<ChevronDown size={16} className="transition group-open:rotate-180" /></summary>
              <p className="mt-2 text-sm text-ink/70">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={logout} className="btn-secondary"><LogOut size={16} /> Keluar</button>
        <button onClick={() => setDel(true)} className="btn-danger">Hapus akun</button>
      </div>

      <Dialog open={del} onClose={() => setDel(false)} title="Hapus akun?">
        <p className="mb-4 text-sm text-ink/70">Akun, koleksi, dan riwayat pesananmu akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</p>
        <div className="flex justify-end gap-2"><button onClick={() => setDel(false)} className="btn-secondary">Batal</button><button onClick={remove} className="btn bg-red-600 text-white hover:bg-red-700">Ya, hapus akun</button></div>
      </Dialog>
    </div>
  );
}
