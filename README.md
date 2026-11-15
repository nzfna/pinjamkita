# PinjamKita

Next.js 15 (App Router) + React + Tailwind + Postgres di Neon, siap deploy ke Vercel.

## Jalankan lokal
1. `npm install`
2. Buat database di https://neon.tech, salin connection string.
3. `cp .env.example .env.local` lalu isi `DATABASE_URL`, `AUTH_SECRET` (`openssl rand -base64 32`), `ADMIN_WA`, `ADMIN_TOKEN`.
4. `npm run db:setup` (membuat tabel dan data contoh)
5. `npm run dev` lalu buka http://localhost:3000

## Deploy ke Vercel
1. Push ke GitHub, import repo di Vercel.
2. Isi Environment Variables yang sama seperti `.env.example`. Set `APP_URL` ke URL Vercel.
3. Jalankan `npm run db:setup` sekali dari lokal (memakai DATABASE_URL yang sama).

## Google login
Buat OAuth Client (Web) di Google Cloud Console. Authorized redirect URI: `{APP_URL}/api/auth/google/callback`. Isi `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET`.

## OTP WhatsApp
- Uji coba: `WA_DEV_MODE=true` menampilkan kode di layar. Matikan di produksi.
- Produksi: isi `WA_CLOUD_TOKEN` dan `WA_PHONE_ID` (WhatsApp Cloud API). Di luar jendela 24 jam Meta mewajibkan template message yang disetujui, sesuaikan `src/lib/whatsapp.ts`.

## Alur admin
Admin mengubah status pesanan lewat API (belum ada UI admin):
```
curl -X PATCH $APP_URL/api/admin/orders/1 \
  -H "x-admin-token: $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"bisa_dipinjam","pickup_address":"Sekretariat BEM","pickup_note":"Jumat 14.00","pickup_lat":-7.952,"pickup_lng":112.614}'
```
Status: `diajukan`, `bisa_dipinjam`, `dipinjam`, `dikembalikan` (isi `return_note` untuk hasil pengecekan).

## Belum termasuk
Pengingat WhatsApp otomatis H-1 dan hari pengembalian (butuh Vercel Cron + template WA), UI admin, upload foto barang, perhitungan denda dan skor reputasi otomatis.
