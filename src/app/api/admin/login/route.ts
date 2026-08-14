import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  createSession, 
  checkLockout, 
  registerFailedAttempt, 
  resetAttempts, 
  logAccessAttempt, 
  getClientIp, 
  verifyTOTP 
} from '@/lib/auth';

export async function POST(request: Request) {
  const ip = await getClientIp();

  try {
    // 1. Check brute-force lockout status (async now)
    const lockout = await checkLockout(ip);
    if (lockout.locked) {
      await logAccessAttempt(ip, 'LOGIN_ATTEMPT', 'BLOCKED', 'Locked out due to too many failed attempts');
      const minutesLeft = Math.ceil(lockout.remainingMs / 60000);
      return NextResponse.json(
        { error: `Muitas tentativas incorretas. Tente novamente em ${minutesLeft} minutos.` },
        { status: 429 }
      );
    }

    const { password, twoFactorCode } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'A senha é obrigatória.' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    // Hardening: Prevent starting server/logging in if the ADMIN_PASSWORD environment variable is missing
    if (!adminPassword) {
      console.error("CRITICAL CONFIGURATION ERROR: process.env.ADMIN_PASSWORD is not set!");
      return NextResponse.json(
        { error: 'Erro de configuração do servidor. Senha administrativa não configurada.' },
        { status: 500 }
      );
    }

    // 2. Validate password
    if (password !== adminPassword) {
      await registerFailedAttempt(ip);
      await logAccessAttempt(ip, 'LOGIN_ATTEMPT', 'FAILURE', 'Incorrect password');
      
      const newLockout = await checkLockout(ip);
      if (newLockout.locked) {
        return NextResponse.json(
          { error: 'Muitas tentativas incorretas. Seu acesso foi bloqueado por 15 minutos.' },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: 'Senha incorreta. Tente novamente.' }, { status: 401 });
    }

    // 3. Password is correct. Check if 2FA (TOTP) is configured
    const twoFactorSecret = process.env.ADMIN_2FA_SECRET;
    if (twoFactorSecret) {
      if (!twoFactorCode) {
        // Return requiring 2FA step to the frontend
        return NextResponse.json({ requires2fa: true });
      }

      // Verify the 6-digit TOTP token
      const is2faValid = verifyTOTP(twoFactorCode, twoFactorSecret);
      if (!is2faValid) {
        await registerFailedAttempt(ip);
        await logAccessAttempt(ip, 'LOGIN_ATTEMPT', 'FAILURE', 'Incorrect 2FA code');
        return NextResponse.json({ error: 'Código 2FA incorreto.' }, { status: 401 });
      }
    }

    // 4. Login successful - Create Session
    await resetAttempts(ip);
    const token = await createSession();
    await logAccessAttempt(ip, 'LOGIN_ATTEMPT', 'SUCCESS');

    // 5. Set secure, HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('autojade_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return NextResponse.json({ success: true, message: 'Autenticado com sucesso!' });
  } catch (error) {
    console.error("Admin Login Error:", error);
    await logAccessAttempt(ip, 'LOGIN_ATTEMPT', 'FAILURE', 'Internal Server Error during login');
    return NextResponse.json({ error: 'Erro interno ao processar autenticação.' }, { status: 500 });
  }
}
