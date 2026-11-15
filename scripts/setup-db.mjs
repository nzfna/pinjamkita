import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';

const sql = neon(process.env.DATABASE_URL);
// kompatibel dengan driver lama (sql("...")) dan baru (sql.query("..."))
const exec = (text) => (typeof sql.query === 'function' ? sql.query(text) : sql(text));

const run = async (file) => {
  const stmts = readFileSync(file, 'utf8').split(/;\s*\r?\n/).map((s) => s.trim()).filter(Boolean);
  for (const s of stmts) await exec(s);
};

await run('db/schema.sql');
const [{ n }] = await exec('select count(*)::int as n from items');
if (n === 0) await run('db/seed.sql');
console.log('Database siap.');