'use client';

import React from 'react';

interface FAQSectionProps {
  whatsappUrl: string;
}

export default function FAQSection({ whatsappUrl }: FAQSectionProps) {
  return (
    <section className="bg-primary text-white py-12 px-6 md:px-12 text-center relative overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full border border-white/5 pointer-events-none"></div>
      <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full border border-white/5 pointer-events-none"></div>
      
      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        <h2 className="text-xl md:text-2xl font-display font-bold">
          Ficou com alguma dúvida sobre como podemos escalar sua operação?
        </h2>
        <p className="text-xs text-secondary/80 max-w-md mx-auto">
          Atendimento direto pelo WhatsApp para esclarecer dúvidas e encontrar a melhor solução para o seu negócio
        </p>
        <div>
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-primary rounded-xl font-bold text-sm shadow-lg hover:bg-secondary/10 hover:text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
          >
            {/* WhatsApp Icon */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.852.002-2.63-1.023-5.101-2.885-6.963C16.588 1.928 14.121.902 11.5.902c-5.448 0-9.873 4.42-9.877 9.855-.001 1.77.461 3.5 1.34 5.014L2.01 21.05l5.35-1.403c1.554.847 3.286 1.288 4.935 1.288z" />
              <path d="M17.438 14.162c-.3-.15-1.774-.875-2.05-.975-.276-.1-.476-.15-.676.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.795-1.49-1.78-1.666-2.08-.175-.3-.02-.463.13-.613.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.625-.925-2.225-.244-.588-.49-.5-.676-.51H8.08c-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.224 5.116 4.525.715.31 1.273.495 1.71.635.717.222 1.37.19 1.886.113.576-.085 1.774-.725 2.025-1.425.25-.7.25-1.3.175-1.425-.076-.125-.276-.2-.576-.35z" />
            </svg>
            Conversar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
