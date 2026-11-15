import { neon } from '@neondatabase/serverless';

let client: ReturnType<typeof neon> | null = null;

// Tagged template: sql`select * from items where id = ${id}`
export async function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  client ??= neon(process.env.DATABASE_URL!);
  return (await client(strings, ...values)) as Record<string, any>[];
}
