'use client';
import { Tent, Projector, Camera, Mic, Package, X } from 'lucide-react';

export function CatIcon({ cat, className }: { cat: string; className?: string }) {
  const I = { Camping: Tent, Elektronik: Projector, Kamera: Camera, Audio: Mic }[cat] ?? Package;
  return <I className={className} aria-hidden />;
}

const STATUS: Record<string, [string, string]> = {
  diajukan: ['Diajukan', 'bg-amber-100 text-amber-800'],
  bisa_dipinjam: ['Bisa dipinjam', 'bg-mint-deep text-brand-dark'],
  dipinjam: ['Dipinjam', 'bg-brand text-white'],
  dikembalikan: ['Dikembalikan', 'bg-ink/10 text-ink/70'],
  dibatalkan: ['Dibatalkan', 'bg-red-100 text-red-800'],
};
export const StatusBadge = ({ status }: { status: string }) => (
  <span className={`badge ${STATUS[status][1]}`}>{STATUS[status][0]}</span>
);

export function Empty({ title, hint, children }: { title: string; hint?: string; children?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-mint text-brand"><Package aria-hidden /></div>
      <p className="font-semibold">{title}</p>
      {hint && <p className="max-w-xs text-sm text-ink/60">{hint}</p>}
      {children}
    </div>
  );
}

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Tutup" className="rounded-lg p-1 hover:bg-ink/5"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      <input className="input" {...p} />
    </label>
  );
}

export async function post(url: string, body?: unknown, method = 'POST') {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, data, status: r.status };
}
