'use client';

import React, { useState } from 'react';

interface DiagnosticFormProps {
  webhookUrl: string;
}

export default function DiagnosticForm({ webhookUrl }: DiagnosticFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleCheckboxChange = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    setIsSubmitting(true);

    if (selectedServices.length === 0) {
      setSubmitError('Por favor, selecione ao menos um serviço de seu interesse.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      companyName,
      contactName,
      email,
      phone,
      services: selectedServices,
      website_url_honeypot: honeypot,
      submittedAt: new Date().toISOString()
    };

    try {
      const targetUrl = webhookUrl || '/api/leads';
      
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setCompanyName('');
        setContactName('');
        setEmail('');
        setPhone('');
        setSelectedServices([]);
        setHoneypot('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSubmitError(errorData.error || 'Ocorreu um erro ao enviar os dados. Tente novamente.');
      }
    } catch {
      setSubmitError('Erro na conexão com o servidor. Verifique sua internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-green-200 p-8 rounded-2xl shadow-xl text-center space-y-4 max-w-lg mx-auto animate-float">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-gray-900 text-xl">Diagnóstico solicitado!</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Obrigado! Suas informações foram recebidas com sucesso. Em breve entraremos em contato.
        </p>
        <button
          onClick={() => setSubmitSuccess(false)}
          className="mt-2 px-6 py-2 bg-primary text-white font-semibold text-xs rounded-lg hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          Concluir
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6">
      {/* Honeypot field (invisible to human users but filled by spambots) */}
      <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
        <input
          type="text"
          name="website_url_honeypot"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="text-center md:text-left">
        <h3 className="text-xl font-display font-bold text-primary">Preencha suas informações</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="company-name" className="block text-xs font-semibold text-gray-700 mb-1">
            Nome da empresa *
          </label>
          <input
            type="text"
            id="company-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Ex: Minha Empresa Ltda"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-light"
            required
            maxLength={100}
            autoComplete="organization"
          />
        </div>

        <div>
          <label htmlFor="contact-name" className="block text-xs font-semibold text-gray-700 mb-1">
            Seu nome *
          </label>
          <input
            type="text"
            id="contact-name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Ex: João Silva"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-light"
            required
            maxLength={100}
            autoComplete="name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
            E-mail corporativo *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex: contato@empresa.com.br"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-light"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1">
            Telefone para contato *
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex: (11) 99999-9999"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-light"
            required
            autoComplete="tel"
            inputMode="tel"
          />
        </div>
      </div>

      {/* Services Checkboxes */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-gray-700">
          Qual serviço chamou sua atenção? (Selecione pelo menos um) *
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label 
            className={`flex items-center p-3 rounded-lg border text-xs cursor-pointer select-none transition-all ${
              selectedServices.includes('Automacao') 
                ? 'bg-secondary/10 border-primary font-medium text-primary' 
                : 'bg-light border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedServices.includes('Automacao')}
              onChange={() => handleCheckboxChange('Automacao')}
              className="mr-2.5 accent-primary h-4 w-4"
            />
            Módulos de automação
          </label>

          <label 
            className={`flex items-center p-3 rounded-lg border text-xs cursor-pointer select-none transition-all ${
              selectedServices.includes('Web') 
                ? 'bg-secondary/10 border-primary font-medium text-primary' 
                : 'bg-light border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedServices.includes('Web')}
              onChange={() => handleCheckboxChange('Web')}
              className="mr-2.5 accent-primary h-4 w-4"
            />
            Desenvolvimento de landing page ou site
          </label>

          <label 
            className={`flex items-center p-3 rounded-lg border text-xs cursor-pointer select-none transition-all ${
              selectedServices.includes('ConteudoVisual') 
                ? 'bg-secondary/10 border-primary font-medium text-primary' 
                : 'bg-light border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedServices.includes('ConteudoVisual')}
              onChange={() => handleCheckboxChange('ConteudoVisual')}
              className="mr-2.5 accent-primary h-4 w-4"
            />
            Criação de conteúdo visual
          </label>
        </div>
      </div>

      {submitError && (
        <p className="text-red-600 text-xs bg-red-50 p-3 rounded border border-red-200">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 active:scale-[0.98] transition-all cursor-pointer text-sm shadow-md shadow-primary/20 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar formulário'}
      </button>
    </form>
  );
}
