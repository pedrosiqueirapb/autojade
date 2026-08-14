'use client';

import React from 'react';
import Image from 'next/image';

export default function Services() {
  return (
    <section id="servicos" className="py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-primary/60">Serviços</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">O que desenvolvemos</h2>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          Cada serviço foi desenvolvido para resolver desafios específicos e pode ser contratado conforme a necessidade da sua empresa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: IA */}
        <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between group">
          <div>
            <div className="relative w-full h-48 bg-dark overflow-hidden">
              <Image 
                src="/service_ai.png" 
                alt="Módulos de automação" 
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-display font-bold text-primary">Módulos de automação</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Automações e agentes inteligentes desenvolvidos sob medida para otimizar processos, integrar ferramentas e eliminar tarefas repetitivas, adaptando-se às necessidades do seu negócio.
              </p>
            </div>
          </div>
          <div className="px-6 pb-6 pt-2">
            <a href="#ia-deep-dive" className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
              Conhecer módulos →
            </a>
          </div>
        </div>

        {/* Card 2: Web Dev */}
        <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between group">
          <div>
            <div className="relative w-full h-48 bg-dark overflow-hidden">
              <Image 
                src="/service_web.png" 
                alt="Landing page ou site" 
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-display font-bold text-primary">Landing page ou site</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Landing page ou site institucional modernos e responsivos, desenvolvidos para fortalecer a presença digital da sua empresa e transmitir credibilidade.
              </p>
            </div>
          </div>
          <div className="px-6 pb-6 pt-2">
            <a href="#contato" className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
              Solicitar site →
            </a>
          </div>
        </div>

        {/* Card 3: Audiovisual */}
        <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between group">
          <div>
            <div className="relative w-full h-48 bg-dark overflow-hidden">
              <Image 
                src="/service_ads.png" 
                alt="Conteúdo visual digital"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-display font-bold text-primary">Conteúdo visual digital</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Criação de artes digitais personalizadas para divulgar produtos, serviços e conteúdos nas redes sociais. Utilizamos inteligência artificial para desenvolver peças atrativas, profissionais e alinhadas aos objetivos de cada cliente.
              </p>
            </div>
          </div>
          <div className="px-6 pb-6 pt-2">
            <a href="#contato" className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
              Solicitar conteúdo →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
