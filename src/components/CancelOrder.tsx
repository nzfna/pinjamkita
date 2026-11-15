'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';
import { Dialog, post } from './ui';

export function CancelOrder({ id }: { id: number }) {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const close = () => { setStep(0); setReason(''); setErr(''); };

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await post(`/api/orders/${id}/cancel`, { reason });
    setBusy(false);
    if (!r.ok) return setErr(r.data.error || 'Pembatalan gagal.');
    if (r.data.waUrl) window.location.href = r.data.waUrl;
    else { close(); router.refresh(); }
  }

  return (
    <>
      <button onClick={() => setStep(1)} className="btn-danger w-full sm:w-auto">Batalkan pengajuan</button>
      <Dialog open={step === 1} onClose={close} title="Batalkan pengajuan?">
        <p className="mb-4 flex gap-2 text-sm text-ink/70"><TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
          Pengajuan #{id} akan dibatalkan dan tidak bisa dibuka lagi. Kamu perlu mengisi alasan dan mengirim konfirmasi ke admin lewat WhatsApp.</p>
        <div className="flex justify-end gap-2">
          <button onClick={close} className="btn-secondary">Kembali</button>
          <button onClick={() => setStep(2)} className="btn bg-red-600 text-white hover:bg-red-700">Lanjutkan</button>
        </div>
      </Dialog>
      <Dialog open={step === 2} onClose={close} title="Alasan pembatalan">
        <form onSubmit={submit} className="space-y-3">
          <label className="block space-y-1.5 text-sm font-medium">
            <span>Kenapa dibatalkan?</span>
            <textarea className="input min-h-24" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} required placeholder="Contoh: acara ditunda" />
          </label>
          {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} className="btn-secondary">Batal</button>
            <button disabled={busy || reason.trim().length < 5} className="btn bg-red-600 text-white hover:bg-red-700">{busy ? 'Memproses...' : 'Kirim konfirmasi ke WhatsApp'}</button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
