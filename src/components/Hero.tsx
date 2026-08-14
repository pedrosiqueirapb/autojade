'use client';

import React from 'react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative pt-16 pb-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center overflow-hidden">
      {/* Glow element */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-glow rounded-full -z-10 animate-pulse-soft"></div>
      
      <div className="space-y-6 text-center lg:text-left">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 leading-tight">
          Escalar sua operação agora ficou <span className="text-primary">simples</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
          Desenvolvemos soluções sob demanda para o seu negócio. Utilizamos inteligência artificial para automatizar processos, criar sites profissionais e desenvolver materiais de divulgação que ajudam a impulsionar suas vendas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
          <a 
            href="#contato" 
            className="px-8 py-3.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 text-center"
          >
            Iniciar projeto
          </a>
          <a 
            href="#servicos" 
            className="px-8 py-3.5 bg-white text-primary border border-primary/25 rounded-lg font-bold text-sm hover:bg-secondary/10 transition-all text-center"
          >
            Conhecer nossos serviços
          </a>
        </div>
      </div>

      <div className="relative mx-auto lg:mx-0 w-full max-w-md lg:max-w-none flex justify-center items-center">
        <div className="relative w-full aspect-square max-w-[450px] rounded-3xl overflow-hidden shadow-2xl border border-secondary/20 animate-float bg-dark">
          <Image 
            src="/hero_tech.png" 
            alt="Conceito Tecnológico Autojade" 
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
