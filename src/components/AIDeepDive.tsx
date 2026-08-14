'use client';

import React from 'react';

interface Automation {
  id: string;
  num: string;
  title: string;
  desc: string;
}

interface AIDeepDiveProps {
  automations?: Automation[];
}

export default function AIDeepDive({ automations }: AIDeepDiveProps) {
  const modules = (automations && automations.length > 0) ? automations : [
    {
      num: '01',
      title: 'Atendimento ao cliente 24h',
      desc: 'Evite perder vendas por demora no retorno. Seus clientes recebem respostas imediatas para as dúvidas mais comuns a qualquer hora do dia ou da noite, garantindo agilidade no contato e mantendo o interesse de quem procura seus serviços.'
    },
    {
      num: '02',
      title: 'Acompanhamento de vendas',
      desc: 'Aumente as chances de fechar novos negócios sem precisar lembrar de enviar mensagens. O sistema envia avisos e novidades aos interessados de forma automática, ajudando a recuperar clientes que pararam de responder.'
    },
    {
      num: '03',
      title: 'Qualificação de interessados',
      desc: 'Foque o seu tempo de vendas apenas em quem realmente tem potencial para comprar. O sistema conversa de forma simples com os novos interessados, filtra quem atende aos seus requisitos e envia os dados organizados para a sua equipe.'
    },
    {
      num: '04',
      title: 'Agendamento de horários',
      desc: 'Elimine erros de marcação e a perda de tempo organizando compromissos. Seus clientes escolhem o horário disponível de forma simples e recebem lembretes automáticos, reduzindo drasticamente os esquecimentos e faltas.'
    },
    {
      num: '05',
      title: 'Leitura de notas fiscais',
      desc: 'Livre sua equipe de digitar notas fiscais e enviar documentos manualmente para o contador. O sistema lê as notas recebidas por e-mail de forma automática, organiza os dados e envia tudo direto para a contabilidade ao fim do mês.'
    },
    {
      num: '06',
      title: 'Pesquisa ativa de clientes',
      desc: 'Mantenha sua equipe comercial sempre abastecida com novas oportunidades. O sistema busca de forma ativa empresas ou clientes com o perfil ideal na internet e inicia o primeiro contato de apresentação do seu negócio.'
    },
    {
      num: '07',
      title: 'Boas-vindas e satisfação',
      desc: 'Melhore a experiência de quem acabou de contratar sua empresa e evite cancelamentos. O sistema guia o novo cliente nos primeiros passos de uso do serviço e solicita avaliações e comentários para garantir a satisfação dele.'
    },
    {
      num: '08',
      title: 'Lembretes para eventos',
      desc: 'Garanta a presença do público em suas reuniões, treinamentos ou palestras. O sistema cuida de todas as inscrições, confirmações de pagamento e envia avisos personalizados com as principais informações antes do início.'
    },
    {
      num: '09',
      title: 'Seleção rápida de currículos',
      desc: 'Agilize a contratação de novos funcionários para a sua empresa sem perder tempo analisando dezenas de e-mails. O sistema analisa os currículos recebidos, seleciona os melhores perfis e marca a entrevista de forma automática.'
    }
  ];

  const [isExpanded, setIsExpanded] = React.useState(false);

  const visibleModules = isExpanded ? modules : modules.slice(0, 6);

  return (
    <section id="ia-deep-dive" className="bg-white py-20 md:py-28 px-6 md:px-12 border-b border-gray-100">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-primary/60">Automações</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Módulos de automação</h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Cada empresa tem desafios diferentes. Por isso, criamos automações personalizadas para a sua realidade. Abaixo, você encontra alguns exemplos de soluções que podemos criar para o seu negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleModules.map((m) => (
            <div 
              key={(m as { id?: string; num: string }).id || m.num} 
              className="p-6 rounded-2xl bg-light hover:bg-secondary/5 border border-gray-100 transition-colors space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {m.num}
              </div>
              <h3 className="font-display font-bold text-gray-950 text-base">{m.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        {modules.length > 6 && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-6 py-3 border border-primary/20 hover:border-primary text-primary hover:bg-secondary/10 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:scale-102 active:scale-98"
            >
              <span>{isExpanded ? 'Ver menos módulos' : 'Ver mais módulos'}</span>
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

        <div className="text-center pt-4">
          <p className="text-sm font-medium text-gray-700">
            Precisa de algo específico? <a href="#contato" className="text-primary hover:underline font-bold">Desenhamos a solução ideal do zero</a> com base na sua necessidade atual.
          </p>
        </div>
      </div>
    </section>
  );
}
