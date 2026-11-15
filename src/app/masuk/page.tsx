import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { LoginForm } from '@/components/AuthForms';

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getUser()) redirect('/');
  return <LoginForm googleError={(await searchParams).error === 'google'} />;
}
