// Link chat WhatsApp ke admin (dipakai untuk redirect setelah pengajuan/pembatalan).
// ADMIN_WA dinormalisasi ke digit saja karena wa.me tidak menerima "+" atau spasi.
export function waLink(text: string) {
  const admin = (process.env.ADMIN_WA || '').replace(/\D/g, '');
  return `https://wa.me/${admin}?text=${encodeURIComponent(text)}`;
}

// Kirim pesan WhatsApp lewat WhatsApp Cloud API bila dikonfigurasi.
// Catatan: di luar jendela 24 jam, Meta mewajibkan template message yang sudah disetujui.
export async function sendWa(to: string, text: string) {
  const { WA_CLOUD_TOKEN: token, WA_PHONE_ID: id } = process.env;
  if (!token || !id) return false;
  const r = await fetch(`https://graph.facebook.com/v20.0/${id}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
  });
  return r.ok;
}
