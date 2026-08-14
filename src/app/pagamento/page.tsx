'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PaymentDetails {
  id: string;
  clientName: string;
  description: string;
  value: number;
  method?: 'pix' | 'card' | 'all';
  pixCode?: string;
  cardUrl?: string;
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) {
      const timer = setTimeout(() => {
        setError('Link de pagamento inválido ou indisponível. Por favor, solicite um link de pagamento personalizado para a equipe Autojade.');
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    fetch(`/api/payments?id=${id}`)
      .then((res) => {
        if (res.ok) return res.json();
        if (res.status === 404) {
          throw new Error('Link de pagamento não encontrado ou expirado.');
        }
        throw new Error('Erro ao processar a requisição de pagamento.');
      })
      .then((data) => {
        setPaymentDetails(data);
        if (data.method === 'card') {
          setPaymentMethod('card');
        } else {
          setPaymentMethod('pix');
        }
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Erro ao carregar os detalhes do pagamento.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) {
    return (
      <div className="w-full max-w-xl p-8 rounded-2xl bg-white shadow-2xl border border-gray-100 relative z-10 flex flex-col justify-center items-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500 font-medium">Buscando informações do pagamento...</p>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="w-full max-w-xl p-8 rounded-2xl bg-white shadow-2xl border border-gray-100 relative z-10 flex flex-col items-center text-center py-16 space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-200">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-gray-900">Acesso não permitido</h3>
          <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
            {error || 'Este link de pagamento não é válido ou já expirou. Entre em contato conosco.'}
          </p>
        </div>
        <Link href="/" className="px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-opacity-95 transition-all shadow-md shadow-primary/20">
          Ir para o site principal
        </Link>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const pixKey = paymentDetails.pixCode || '';
  const qrCodeUrl = pixKey ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixKey)}` : '';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full max-w-xl p-8 rounded-2xl bg-white shadow-2xl border border-gray-100 relative z-10">
      {/* Header */}
      <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-100">
        <Link href="/" className="text-xs text-primary/60 hover:text-primary transition-colors mb-4 flex items-center gap-1">
          ← Voltar ao site principal
        </Link>
        <span className="text-2xl font-display font-bold tracking-wide text-primary">Autojade</span>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Checkout Seguro</p>
      </div>

      {/* Invoice Summary */}
      <div className="bg-light p-4 rounded-xl mb-6 space-y-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-primary/60 tracking-wider block">Nome do cliente</span>
          <span className="font-display font-semibold text-gray-900 text-sm mt-0.5 block">{paymentDetails.clientName}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-primary/60 tracking-wider block">Descrição do serviço</span>
          <h3 className="font-display font-semibold text-gray-900 text-sm mt-0.5 leading-relaxed">{paymentDetails.description}</h3>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-200/60">
          <span className="text-xs text-gray-500 font-medium">Total a pagar</span>
          <span className="font-display font-bold text-primary text-xl">{formatCurrency(paymentDetails.value)}</span>
        </div>
      </div>

      {/* Method Selection */}
      {(!paymentDetails.method || paymentDetails.method === 'all') && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setPaymentMethod('pix')}
            className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 border ${
              paymentMethod === 'pix'
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Pagar com PIX
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 border ${
              paymentMethod === 'card'
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Pagar com cartão
          </button>
        </div>
      )}

      {/* PIX Option Interface */}
      {paymentMethod === 'pix' && (
        <div className="space-y-4 text-center animate-fade-in">
          <p className="text-xs text-gray-600">
            Escaneie o QR Code abaixo com o aplicativo do seu banco para realizar o pagamento.
          </p>
          
          <div className="mx-auto w-48 h-48 bg-white border border-gray-200 rounded-xl p-2.5 flex items-center justify-center shadow-md relative">
            {qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeUrl}
                alt="QR Code PIX"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleCopyPix}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                copied 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-light text-primary border-primary/20 hover:bg-secondary/10'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {copied ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                )}
              </svg>
              {copied ? 'Código copiado!' : 'Copiar PIX copia e cola'}
            </button>
          </div>
          
          <div className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5 pt-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Aprovação automática e liberação imediata.
          </div>
        </div>
      )}

      {/* Credit Card Option Interface */}
      {paymentMethod === 'card' && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-xs text-gray-600 text-center">
            Pague com cartão de crédito via checkout seguro em ambiente criptografado.
          </p>

          <div className="border border-gray-200 rounded-xl p-6 bg-light flex flex-col items-center justify-center text-center space-y-4 py-8">
            <svg className="w-12 h-12 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <h4 className="font-semibold text-sm text-gray-900">Checkout criptografado</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Você será redirecionado para a plataforma de pagamento parceira para concluir a transação.
              </p>
            </div>

            <a
              href={paymentDetails.cardUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 active:scale-[0.98] transition-all text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              Ir para o pagamento
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <div className="flex justify-center items-center gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">🔒 SSL de 256 bits</span>
            <span className="flex items-center gap-1">⚡ Processamento seguro</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PagamentoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-dark p-4 font-sans selection:bg-secondary selection:text-dark">
      {/* Background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-glow rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-glow rounded-full translate-x-1/2 translate-y-1/2"></div>

      <Suspense fallback={
        <div className="w-full max-w-xl p-8 rounded-2xl bg-white shadow-2xl border border-gray-100 relative z-10 flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <PaymentContent />
      </Suspense>
    </main>
  );
}
