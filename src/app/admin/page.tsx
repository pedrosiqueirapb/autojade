import { cookies } from 'next/headers';
import { validateSession } from '@/lib/auth';
import AdminDashboard from './AdminDashboard';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('autojade_session')?.value;
  const isAuthenticated = sessionToken ? await validateSession(sessionToken) : false;

  if (isAuthenticated) {
    return <AdminDashboard />;
  } else {
    return <LoginForm />;
  }
}
