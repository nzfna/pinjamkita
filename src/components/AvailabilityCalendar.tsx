const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function AvailabilityCalendar({ days, stock }: { days: { d: string; sisa: number }[]; stock: number }) {
  const months = new Map<string, typeof days>();
  for (const x of days) months.set(x.d.slice(0, 7), [...(months.get(x.d.slice(0, 7)) ?? []), x]);
  return (
    <section aria-label="Kalender ketersediaan" className="space-y-4">
      <h2 className="text-lg font-bold">Kalender ketersediaan</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {[...months.entries()].map(([ym, list]) => {
          const first = new Date(list[0].d + 'T00:00:00Z');
          const lead = (first.getUTCDay() + 6) % 7;
          return (
            <div key={ym} className="card p-3">
              <p className="mb-2 text-center text-sm font-bold">{first.toLocaleDateString('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>
              <div className="grid grid-cols-7 gap-1 text-center">
                {HARI.map((h) => <span key={h} className="text-[11px] font-semibold text-ink/50">{h}</span>)}
                {Array.from({ length: lead }).map((_, i) => <span key={`b${i}`} />)}
                {list.map((x) => {
                  const full = x.sisa <= 0, part = !full && x.sisa < stock;
                  return (
                    <div key={x.d} className={`flex h-12 flex-col items-center justify-center rounded-lg text-xs ${full ? 'bg-red-100 text-red-800' : part ? 'bg-amber-50 text-amber-800' : 'bg-mint text-brand-dark'}`}>
                      <b>{Number(x.d.slice(8))}</b>
                      <span className="text-[9px] leading-none">{full ? 'Dipinjam' : part ? `Sisa ${x.sisa}` : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
        <span><i className="mr-1 inline-block size-3 rounded bg-mint align-middle" />Tersedia</span>
        <span><i className="mr-1 inline-block size-3 rounded bg-amber-100 align-middle" />Sebagian dipinjam</span>
        <span><i className="mr-1 inline-block size-3 rounded bg-red-100 align-middle" />Dipinjam (stok habis)</span>
      </p>
    </section>
  );
}
