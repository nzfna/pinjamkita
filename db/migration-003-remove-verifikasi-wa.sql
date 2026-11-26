-- Menghapus fitur verifikasi WhatsApp (OTP).
drop table if exists otps;
alter table users drop column if exists wa_verified;
