import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { RegisterForm } from '@/components/AuthForms';

export default async function Page() {
  if (await getUser()) redirect('/');
  return <RegisterForm />;
}
