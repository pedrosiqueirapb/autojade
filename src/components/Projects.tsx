'use client';

import React from 'react';
import { Project } from '@/lib/db';

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const visibleProjects = isExpanded ? projects : projects.slice(0, 6);

  return (
    <section id="projetos" className="py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-primary/60">Portfólio</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Conheça nosso trabalho</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Confira alguns dos projetos e soluções desenvolvidos pela Autojade.
        </p>
      </div>

      {projects.length === 0 ? (
        <p className="text-center text-gray-500 py-12 text-sm font-medium">Nenhum projeto cadastrado no momento. Em breve compartilharemos novas soluções!</p>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleProjects.map((project) => (
              <article 
                key={project.id} 
                className="bg-white rounded-2xl overflow-hidden shadow border border-gray-100 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-5">
                  <div className="relative w-full h-44 bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{project.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{project.description}</p>
                </div>
                <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-medium">
                  <span>Autojade</span>
                  <span>{new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </article>
            ))}
          </div>

          {projects.length > 6 && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-6 py-3 border border-primary/20 hover:border-primary text-primary hover:bg-secondary/10 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:scale-102 active:scale-98"
              >
                <span>{isExpanded ? 'Ver menos projetos' : 'Ver mais projetos'}</span>
                <svg 
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
