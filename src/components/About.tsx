'use client';

import React from 'react';

export default function About() {
  return (
    <section id="sobre" className="bg-white py-16 md:py-24 px-6 md:px-12 border-y border-gray-100">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <span className="text-xs uppercase font-extrabold tracking-widest text-primary/60">Quem somos</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-950">
          Criamos soluções que trabalham para o crescimento do seu negócio
        </h2>
        <div className="w-12 h-1 bg-primary mx-auto rounded"></div>
        <p className="text-gray-600 leading-relaxed text-base md:text-lg">
          A Autojade nasceu com um objetivo simples: desenvolver soluções que impulsionem o crescimento de empresas. Acreditamos que cada negócio possui desafios únicos e, por isso, criamos soluções sob medida — seja automatizando processos, construindo uma presença digital sólida ou criando ativos visuais que atraem e convertem novos clientes.
        </p>
      </div>
    </section>
  );
}
