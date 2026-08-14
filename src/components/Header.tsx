'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass-light border-b border-primary/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
      <Link href="/" className="flex items-center gap-2.5">
        <Image 
          src="/logo.jpg" 
          alt="Autojade Logo" 
          width={40} 
          height={40} 
          className="rounded-lg shadow border border-primary/10"
          priority
        />
        <span className="text-xl font-display font-extrabold tracking-wide text-primary">Autojade</span>
      </Link>
      
      <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-700">
        <a href="#sobre" className="hover:text-primary transition-colors">Sobre</a>
        <a href="#servicos" className="hover:text-primary transition-colors">Serviços</a>
        <a href="#projetos" className="hover:text-primary transition-colors">Projetos</a>
      </nav>

      <div>
        <a 
          href="#contato" 
          className="px-5 py-2.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-opacity-95 transition-all shadow-md shadow-primary/20 block"
        >
          Fale conosco
        </a>
      </div>
    </header>
  );
}
