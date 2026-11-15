export const CATS = ['Camping', 'Elektronik', 'Kamera', 'Audio'];
export const rp = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');
export const tgl = (d: string) =>
  new Date(d.slice(0, 10) + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
export function normWa(s: string) {
  let d = (s || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '62' + d.slice(1);
  else if (d.startsWith('8')) d = '62' + d;
  return d;
}
export const validWa = (d: string) => /^62\d{9,13}$/.test(d);
export const STATUS_STEPS = ['diajukan', 'bisa_dipinjam', 'dipinjam', 'dikembalikan'];
