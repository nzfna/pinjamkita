import { requireUser } from '@/lib/auth';
import { AccountClient } from '@/components/AccountClient';

export default async function Akun() {
  const u = await requireUser();
  return <AccountClient user={u} />;
}
