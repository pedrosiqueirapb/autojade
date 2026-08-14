'use client';

import React from 'react';
import Image from 'next/image';

interface FooterProps {
  whatsappUrl: string;
}

export default function Footer({ whatsappUrl }: FooterProps) {
  return (
    <footer className="bg-dark text-white py-12 px-6 md:px-12 border-t border-secondary/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <Image 
            src="/logo.jpg" 
            alt="Autojade logo" 
            width={35} 
            height={35} 
            className="rounded"
          />
          <span className="text-lg font-display font-bold text-secondary tracking-wide">Autojade</span>
        </div>

        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Autojade. Todos os direitos reservados.
        </p>

        {/* Social Icons */}
        <div className="flex items-center gap-5">
          <a 
            href="https://www.instagram.com/autojade_ia/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Instagram"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
          </a>
          
          <a 
            href="https://www.youtube.com/@autojade_ia" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="YouTube"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.002 3.002 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>

          <a 
            href={whatsappUrl}
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="WhatsApp"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.852.002-2.63-1.023-5.101-2.885-6.963C16.588 1.928 14.121.902 11.5.902c-5.448 0-9.873 4.42-9.877 9.855-.001 1.77.461 3.5 1.34 5.014L2.01 21.05l5.35-1.403c1.554.847 3.286 1.288 4.935 1.288z" />
              <path d="M17.438 14.162c-.3-.15-1.774-.875-2.05-.975-.276-.1-.476-.15-.676.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.795-1.49-1.78-1.666-2.08-.175-.3-.02-.463.13-.613.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.625-.925-2.225-.244-.588-.49-.5-.676-.51H8.08c-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.224 5.116 4.525.715.31 1.273.495 1.71.635.717.222 1.37.19 1.886.113.576-.085 1.774-.725 2.025-1.425.25-.7.25-1.3.175-1.425-.076-.125-.276-.2-.576-.35z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
