import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession, logAccessAttempt, getClientIp } from '@/lib/auth';

export async function POST() {
  const ip = await getClientIp();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('autojade_session')?.value;

    if (token) {
      await deleteSession(token);
      cookieStore.delete('autojade_session');
      await logAccessAttempt(ip, 'LOGOUT', 'SUCCESS', 'User logged out successfully');
    }

    return NextResponse.json({ success: true, message: 'Sessão encerrada com sucesso!' });
  } catch (error) {
    console.error("Admin Logout Error:", error);
    return NextResponse.json({ error: 'Erro ao processar encerramento de sessão.' }, { status: 500 });
  }
}
