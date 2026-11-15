import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { VerifyWa } from '@/components/AuthForms';

export default async function Page() {
  const u = await getUser();
  if (!u) redirect('/masuk');
  if (u.wa_verified) redirect('/');
  return <VerifyWa wa={u.wa ?? ''} />;
}
