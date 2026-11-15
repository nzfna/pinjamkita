import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';

// Menjalankan migrasi idempoten dari db/schema.sql pada database yang sudah ada.
// `create table if not exists` tidak menambah kolom baru, jadi perubahan kolom
// harus ditulis sebagai "alter table ... add column if not exists ...".
const sql = neon(process.env.DATABASE_URL);
const exec = (text) => (typeof sql.query === 'function' ? sql.query(text) : sql(text));

const stmts = readFileSync('db/schema.sql', 'utf8')
  .split(/;\s*\r?\n/)
  .map((s) => s.trim())
  .filter(Boolean);

for (const s of stmts) await exec(s);

const cols = await exec(
  `select column_name from information_schema.columns where table_name = 'orders' order by ordinal_position`,
);
console.log('Migrasi selesai. Kolom orders:', cols.map((c) => c.column_name).join(', '));
