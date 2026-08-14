'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2fa, setRequires2fa] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setLoginError('Por favor, insira a senha.');
      return;
    }

    if (requires2fa && !twoFactorCode) {
      setLoginError('Por favor, insira o código 2FA de 6 dígitos.');
      return;
    }

    setLoginError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          password,
          twoFactorCode: requires2fa ? twoFactorCode : undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requires2fa) {
          setRequires2fa(true);
          setLoginError('');
          setTwoFactorCode(''); // Reset any previous input code
        } else {
          window.location.reload(); // Reload to trigger Server Component auth evaluation
        }
      } else {
        setLoginError(data.error || 'Senha incorreta. Tente novamente.');
        if (requires2fa) {
          setTwoFactorCode(''); // Clear invalid code for retry
        }
      }
    } catch {
      setLoginError('Erro ao conectar ao servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-dark p-4 font-sans selection:bg-secondary selection:text-dark relative overflow-hidden">
      {/* Glow elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-glow rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-glow rounded-full translate-x-1/2 translate-y-1/2"></div>
      
      <div className="w-full max-w-md p-8 rounded-2xl glass-dark relative z-10 shadow-2xl border border-secondary/20">
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="text-secondary hover:text-white transition-colors mb-4 flex items-center gap-2">
            <span className="text-xl">←</span> Voltar para o site
          </Link>
          <h1 className="text-3xl font-display font-bold text-white tracking-wide">Painel administrativo</h1>
          <p className="text-gray-400 text-sm mt-2">Autojade</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-pass" className="block text-sm font-medium text-gray-300 mb-2">
              Senha de acesso
            </label>
            <input
              type="password"
              id="admin-pass"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Insira a senha do painel"
              className="w-full px-4 py-3 bg-dark/60 text-white rounded-lg border border-secondary/20 focus:border-secondary focus:outline-none transition-colors text-sm disabled:opacity-60"
              required
              disabled={isSubmitting || requires2fa}
            />
          </div>

          {requires2fa && (
            <div className="animate-fade-in space-y-2">
              <label htmlFor="admin-2fa" className="block text-sm font-medium text-gray-300">
                Código de segurança (MFA / 2FA)
              </label>
              <p className="text-[11px] text-gray-400 mb-2">
                Abra seu aplicativo autenticador para consultar o código.
              </p>
              <input
                type="text"
                id="admin-2fa"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 bg-dark/60 text-white rounded-lg border border-secondary/20 focus:border-secondary focus:outline-none transition-colors text-sm text-center font-mono tracking-widest text-lg"
                required
                disabled={isSubmitting}
                maxLength={6}
                pattern="[0-9]*"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>
          )}

          {loginError && (
            <p className="text-red-400 text-xs bg-red-950/40 p-3 rounded-lg border border-red-500/20 leading-relaxed">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-primary/20 text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Acessando...' : requires2fa ? 'Confirmar código' : 'Acessar painel'}
          </button>
        </form>
      </div>
    </main>
  );
}
