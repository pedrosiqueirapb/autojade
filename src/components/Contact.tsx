'use client';

import React from 'react';
import DiagnosticForm from './DiagnosticForm';

interface ContactProps {
  webhookUrl: string;
}

export default function Contact({ webhookUrl }: ContactProps) {
  return (
    <section id="contato" className="bg-light py-20 md:py-28 px-6 md:px-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          <span className="text-xs uppercase font-extrabold tracking-widest text-primary/60">Contato</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 leading-tight">
            Vamos conversar sobre o seu projeto
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto lg:mx-0">
            Preencha o formulário ao lado e entraremos em contato para entender melhor as necessidades da sua empresa. A partir dessa conversa, apresentaremos as soluções que fazem sentido para o seu negócio e esclareceremos todas as suas dúvidas.
          </p>
          <div className="hidden lg:block pt-4 space-y-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Atendimento personalizado
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Soluções pensadas para a realidade da sua empresa
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Sem compromisso
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <DiagnosticForm webhookUrl={webhookUrl} />
        </div>
      </div>
    </section>
  );
}
