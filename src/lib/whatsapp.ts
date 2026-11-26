// Link chat WhatsApp ke admin (dipakai untuk redirect setelah pengajuan/pembatalan).
// ADMIN_WA dinormalisasi ke digit saja karena wa.me tidak menerima "+" atau spasi.
export function waLink(text: string) {
  const admin = (process.env.ADMIN_WA || '').replace(/\D/g, '');
  return `https://wa.me/${admin}?text=${encodeURIComponent(text)}`;
}
