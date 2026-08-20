'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  createdAt: string;
}

interface Payment {
  id: string;
  clientName: string;
  description: string;
  value: number;
  method?: 'pix' | 'card' | 'all';
  cardUrl?: string;
  billingType?: 'single' | 'recurrent';
  createdAt: string;
}

interface Automation {
  id: string;
  num: string;
  title: string;
  desc: string;
  createdAt: string;
}

export default function AdminDashboard() {
  // Tab State
  const [activeTab, setActiveTab] = useState<'portfolio' | 'payments' | 'automations'>('portfolio');

  // Project Form State
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageType, setImageType] = useState<'upload' | 'url'>('upload');
  const [imageFileName, setImageFileName] = useState('');
  
  // Projects List State
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Payment Link Form State
  const [paymentDesc, setPaymentDesc] = useState('');
  const [paymentVal, setPaymentVal] = useState<number | ''>('');
  const [paymentClient, setPaymentClient] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'all'>('all');
  const [billingType, setBillingType] = useState<'single' | 'recurrent'>('single');
  const [paymentError, setPaymentError] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Payments List State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(true);
  const [refreshPaymentsTrigger, setRefreshPaymentsTrigger] = useState(0);
  const [copiedLinkMap, setCopiedLinkMap] = useState<{ [id: string]: boolean }>({});

  // Automation Form & List State
  const [editingAutoId, setEditingAutoId] = useState<string | null>(null);
  const [autoNum, setAutoNum] = useState('');
  const [autoTitle, setAutoTitle] = useState('');
  const [autoDesc, setAutoDesc] = useState('');
  const [autoError, setAutoError] = useState('');
  const [isSubmittingAuto, setIsSubmittingAuto] = useState(false);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isAutomationsLoading, setIsAutomationsLoading] = useState(true);
  const [refreshAutomationsTrigger, setRefreshAutomationsTrigger] = useState(0);

  // Trigger project loading once active tab is portfolio
  useEffect(() => {
    if (activeTab !== 'portfolio') return;
    
    let active = true;

    fetch('/api/projects')
      .then((res) => {
        if (res.status === 401) {
          window.location.reload();
          throw new Error('Sessão expirada');
        }
        if (res.ok) return res.json();
        throw new Error('Failed to fetch projects');
      })
      .then((data) => {
        if (active) {
          setProjects(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load projects:', err);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [activeTab, refreshTrigger]);

  // Load payments list when active tab is payments
  useEffect(() => {
    if (activeTab !== 'payments') return;
    
    let active = true;

    fetch('/api/payments')
      .then((res) => {
        if (res.status === 401) {
          window.location.reload();
          throw new Error('Sessão expirada');
        }
        if (res.ok) return res.json();
        throw new Error('Failed to fetch payments');
      })
      .then((data) => {
        if (active) {
          setPayments(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load payments:', err);
      })
      .finally(() => {
        if (active) {
          setIsPaymentsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [activeTab, refreshPaymentsTrigger]);

  // Load automations list when active tab is automations
  useEffect(() => {
    if (activeTab !== 'automations') return;
    
    let active = true;

    fetch('/api/automations')
      .then((res) => {
        if (res.status === 401) {
          window.location.reload();
          throw new Error('Sessão expirada');
        }
        if (res.ok) return res.json();
        throw new Error('Failed to fetch automations');
      })
      .then((data) => {
        if (active) {
          setAutomations(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load automations:', err);
      })
      .finally(() => {
        if (active) {
          setIsAutomationsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [activeTab, refreshAutomationsTrigger]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setTitle('');
    setDescription('');
    setImageFile(null);
    setImageFileName('');
    setImageUrl('');
    // Reset file input element if possible
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleEditClick = (project: Project) => {
    setEditingProjectId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setImageFile(null);
    setImageFileName('');
    
    // Set image fields
    if (project.image.startsWith('http') || project.image.startsWith('/')) {
      setImageUrl(project.image);
      setImageType('url');
    } else {
      // It is base64
      setImageUrl('');
      setImageType('upload');
    }
    
    // Smooth scroll to top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    if (!title || !description) {
      setSubmitError('Título e descrição são obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    let finalImage: string | undefined = undefined;
    if (imageType === 'upload') {
      if (imageFile) {
        try {
          finalImage = await fileToBase64(imageFile);
        } catch {
          setSubmitError('Erro ao processar imagem.');
          setIsSubmitting(false);
          return;
        }
      } else if (!editingProjectId) {
        setSubmitError('Por favor, selecione uma imagem para upload.');
        setIsSubmitting(false);
        return;
      }
    } else {
      if (imageUrl) {
        finalImage = imageUrl;
      } else if (!editingProjectId) {
        setSubmitError('Por favor, insira a URL da imagem.');
        setIsSubmitting(false);
        return;
      }
    }

    const url = '/api/projects';
    const method = editingProjectId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingProjectId || undefined,
          title,
          description,
          image: finalImage
        })
      });

      if (response.ok) {
        handleCancelEdit(); // Clears form states and resets editingProjectId
        setIsLoading(true);
        setRefreshTrigger(prev => prev + 1); // Trigger reload
      } else if (response.status === 401) {
        alert('Sua sessão expirou.');
        window.location.reload();
      } else {
        const errData = await response.json();
        setSubmitError(errData.error || 'Erro ao salvar projeto.');
      }
    } catch {
      setSubmitError('Erro na requisição. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Deseja realmente excluir este projeto?')) return;

    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setIsLoading(true);
        setRefreshTrigger(prev => prev + 1); // Trigger reload
        if (editingProjectId === id) {
          handleCancelEdit();
        }
      } else if (response.status === 401) {
        alert('Sua sessão expirou.');
        window.location.reload();
      } else {
        const errData = await response.json();
        alert(errData.error || 'Erro ao excluir projeto.');
      }
    } catch {
      alert('Erro na requisição. Tente novamente.');
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setIsSubmittingPayment(true);

    if (!paymentDesc || paymentVal === '' || !paymentClient) {
      setPaymentError('Nome do cliente, descrição e valor são obrigatórios.');
      setIsSubmittingPayment(false);
      return;
    }

    const numericValue = Number(paymentVal);
    if (isNaN(numericValue) || numericValue <= 0) {
      setPaymentError('Por favor, insira um valor válido maior que zero.');
      setIsSubmittingPayment(false);
      return;
    }

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: paymentDesc,
          value: numericValue,
          clientName: paymentClient,
          method: billingType === 'recurrent' ? 'card' : paymentMethod,
          billingType: billingType
        })
      });

      if (response.ok) {
        setPaymentDesc('');
        setPaymentVal('');
        setPaymentClient('');
        setPaymentMethod('all');
        setBillingType('single');
        setRefreshPaymentsTrigger(prev => prev + 1);
      } else if (response.status === 401) {
        alert('Sua sessão expirou.');
        window.location.reload();
      } else {
        const errData = await response.json();
        setPaymentError(errData.error || 'Erro ao gerar link de pagamento.');
      }
    } catch {
      setPaymentError('Erro na requisição. Tente novamente.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm('Deseja realmente excluir este link de pagamento? Ele deixará de funcionar imediatamente.')) return;

    try {
      const response = await fetch(`/api/payments?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRefreshPaymentsTrigger(prev => prev + 1);
      } else if (response.status === 401) {
        alert('Sua sessão expirou.');
        window.location.reload();
      } else {
        const errData = await response.json();
        alert(errData.error || 'Erro ao excluir link de pagamento.');
      }
    } catch {
      alert('Erro na requisição. Tente novamente.');
    }
  };

  const handleSubmitAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    setAutoError('');
    setIsSubmittingAuto(true);

    if (!autoNum || !autoTitle || !autoDesc) {
      setAutoError('Todos os campos (Número, Título e Descrição) são obrigatórios.');
      setIsSubmittingAuto(false);
      return;
    }

    try {
      const isEditing = !!editingAutoId;
      const url = '/api/automations';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing 
        ? { id: editingAutoId, num: autoNum, title: autoTitle, desc: autoDesc }
        : { num: autoNum, title: autoTitle, desc: autoDesc };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        handleCancelAutoEdit();
        setRefreshAutomationsTrigger(prev => prev + 1);
      } else if (response.status === 401) {
        alert('Sua sessão expirou.');
        window.location.reload();
      } else {
        const errData = await response.json();
        setAutoError(errData.error || 'Erro ao salvar módulo de automação.');
      }
    } catch {
      setAutoError('Erro na requisição. Tente novamente.');
    } finally {
      setIsSubmittingAuto(false);
    }
  };

  const handleEditAutoClick = (auto: Automation) => {
    setEditingAutoId(auto.id);
    setAutoNum(auto.num);
    setAutoTitle(auto.title);
    setAutoDesc(auto.desc);
    setAutoError('');
  };

  const handleCancelAutoEdit = () => {
    setEditingAutoId(null);
    setAutoNum('');
    setAutoTitle('');
    setAutoDesc('');
    setAutoError('');
  };

  const handleDeleteAutomation = async (id: string) => {
    if (!confirm('Deseja realmente excluir este módulo de automação? Ele deixará de aparecer no site imediatamente.')) return;

    try {
      const response = await fetch(`/api/automations?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRefreshAutomationsTrigger(prev => prev + 1);
      } else if (response.status === 401) {
        alert('Sua sessão expirou.');
        window.location.reload();
      } else {
        const errData = await response.json();
        alert(errData.error || 'Erro ao excluir módulo de automação.');
      }
    } catch {
      alert('Erro na requisição. Tente novamente.');
    }
  };

  const getPaymentUrl = (id: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/pagamento?id=${id}`;
    }
    return `/pagamento?id=${id}`;
  };

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkMap(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedLinkMap(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-light text-dark font-sans pb-12">
      {/* Header Panel */}
      <header className="bg-dark text-white py-4 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-display font-bold tracking-wide text-secondary">Autojade</span>
            <span className="bg-primary px-2 py-0.5 rounded text-xs font-semibold">Painel admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">
              Ir para o site
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium transition-colors cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Selector */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setIsLoading(true);
              setActiveTab('portfolio');
            }}
            className={`py-3 px-6 font-display font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'portfolio'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-primary'
            }`}
          >
            Portfólio de projetos
          </button>
          <button
            onClick={() => {
              setIsAutomationsLoading(true);
              setActiveTab('automations');
            }}
            className={`py-3 px-6 font-display font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'automations'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-primary'
            }`}
          >
            Módulos de automação
          </button>
          <button
            onClick={() => {
              setIsPaymentsLoading(true);
              setActiveTab('payments');
            }}
            className={`py-3 px-6 font-display font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-primary'
            }`}
          >
            Links de pagamento
          </button>
        </div>
      </div>

      {/* PORTFOLIO TAB */}
      {activeTab === 'portfolio' && (
        <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit animate-fade-in">
            <h2 className="text-xl font-display font-bold text-primary mb-4">
              {editingProjectId ? 'Editar projeto' : 'Novo projeto'}
            </h2>
            
            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none text-sm h-28 resize-y"
                  required
                ></textarea>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">Origem da imagem</span>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center text-xs cursor-pointer select-none">
                    <input
                      type="radio"
                      name="imageType"
                      checked={imageType === 'upload'}
                      onChange={() => setImageType('upload')}
                      className="mr-1.5 accent-primary"
                    />
                    Fazer upload (arquivo)
                  </label>
                  <label className="flex items-center text-xs cursor-pointer select-none">
                    <input
                      type="radio"
                      name="imageType"
                      checked={imageType === 'url'}
                      onChange={() => setImageType('url')}
                      className="mr-1.5 accent-primary"
                    />
                    URL da imagem
                  </label>
                </div>

                {imageType === 'upload' ? (
                  <div>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="image-upload"
                        className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 text-primary text-xs font-semibold rounded-md cursor-pointer transition-colors"
                      >
                        Escolher arquivo
                      </label>
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {imageFileName || 'Nenhum arquivo escolhido'}
                      </span>
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setImageFile(file);
                            setImageFileName(file.name);
                          }
                        }}
                        className="sr-only"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5">Recomendado: imagens JPG/PNG quadradas ou horizontais.</p>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder={editingProjectId ? 'Manter imagem cadastrada ou inserir nova URL' : 'https://exemplo.com/imagem.jpg'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none text-sm"
                  />
                )}
              </div>

              {submitError && (
                <p className="text-red-600 text-xs bg-red-50 p-2.5 rounded border border-red-200">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Salvando...' : (editingProjectId ? 'Salvar alterações' : 'Salvar projeto')}
              </button>

              {editingProjectId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all text-sm cursor-pointer mt-2"
                >
                  Cancelar edição
                </button>
              )}
            </form>
          </div>

          {/* List Column */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-display font-bold text-primary mb-4">Projetos cadastrados</h2>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : projects.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">Nenhum projeto cadastrado ainda. Use o formulário ao lado para adicionar.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-100 rounded-lg overflow-hidden flex flex-col justify-between shadow-sm bg-gray-50/50 hover:border-gray-200 transition-colors">
                    <div className="p-4">
                      {/* Image preview */}
                      <div className="relative w-full h-32 bg-gray-200 rounded-md overflow-hidden mb-3 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo.jpg';
                          }}
                        />
                      </div>
                      <h3 className="font-display font-bold text-gray-900 text-base mb-1 line-clamp-1">{project.title}</h3>
                      <p className="text-gray-600 text-xs line-clamp-3 leading-relaxed">{project.description}</p>
                    </div>
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-[10px] text-gray-400">
                        {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(project)}
                          className="text-primary hover:text-primary-dark cursor-pointer p-1.5 rounded hover:bg-secondary/10 transition-colors border border-transparent hover:border-primary/20"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer p-1.5 rounded hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                          title="Excluir"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUTOMATIONS TAB */}
      {activeTab === 'automations' && (
        <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit animate-fade-in">
            <h2 className="text-xl font-display font-bold text-primary mb-4">
              {editingAutoId ? 'Editar módulo' : 'Novo módulo'}
            </h2>
            
            <form onSubmit={handleSubmitAutomation} className="space-y-4">
              <div>
                <label htmlFor="autoNum" className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  id="autoNum"
                  value={autoNum}
                  onChange={(e) => setAutoNum(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none text-sm"
                  required
                  maxLength={5}
                />
              </div>

              <div>
                <label htmlFor="autoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  id="autoTitle"
                  value={autoTitle}
                  onChange={(e) => setAutoTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none text-sm"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label htmlFor="autoDesc" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  id="autoDesc"
                  value={autoDesc}
                  onChange={(e) => setAutoDesc(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none text-sm resize-none"
                  required
                />
              </div>

              {autoError && (
                <p className="text-red-600 text-xs bg-red-50 p-2.5 rounded border border-red-200">
                  {autoError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingAuto}
                  className={`flex-1 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow text-sm ${isSubmittingAuto ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmittingAuto ? 'Salvando...' : editingAutoId ? 'Salvar alterações' : 'Adicionar módulo'}
                </button>
                {editingAutoId && (
                  <button
                    type="button"
                    onClick={handleCancelAutoEdit}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all cursor-pointer text-sm"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Column */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-display font-bold text-primary mb-4">Módulos cadastrados</h2>

            {isAutomationsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : automations.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">Nenhum módulo de automação cadastrado. Use o formulário ao lado.</p>
            ) : (
              <div className="space-y-4">
                {automations.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-gray-200 transition-colors">
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded">Módulo {a.num}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight pt-1">{a.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{a.desc}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleEditAutoClick(a)}
                        className="px-3 py-1.5 bg-white text-primary border border-primary/20 hover:bg-secondary/10 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteAutomation(a.id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
                        title="Excluir módulo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAYMENTS TAB */}
      {activeTab === 'payments' && (
        <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit animate-fade-in">
            <h2 className="text-xl font-display font-bold text-primary mb-4">Gerar link</h2>
            
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label htmlFor="paymentClient" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do cliente
                </label>
                <input
                  type="text"
                  id="paymentClient"
                  value={paymentClient}
                  onChange={(e) => setPaymentClient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="paymentDesc" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição do serviço
                </label>
                <input
                  type="text"
                  id="paymentDesc"
                  value={paymentDesc}
                  onChange={(e) => setPaymentDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="paymentVal" className="block text-sm font-medium text-gray-700 mb-1">
                  {billingType === 'recurrent' ? 'Valor da mensalidade (R$)' : 'Valor total (R$)'}
                </label>
                <input
                  type="number"
                  id="paymentVal"
                  value={paymentVal}
                  onChange={(e) => setPaymentVal(e.target.value === '' ? '' : Number(e.target.value))}
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="billingType" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de cobrança
                </label>
                <select
                  id="billingType"
                  value={billingType}
                  onChange={(e) => {
                     const val = e.target.value as 'single' | 'recurrent';
                     setBillingType(val);
                     if (val === 'recurrent') {
                       setPaymentMethod('card');
                     }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none text-sm bg-white"
                  required
                >
                  <option value="single">Cobrança única</option>
                  <option value="recurrent">Assinatura recorrente</option>
                </select>
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de pagamento
                </label>
                {billingType === 'recurrent' ? (
                  <select
                    id="paymentMethod"
                    value="card"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 focus:outline-none text-sm cursor-not-allowed"
                  >
                    <option value="card">Cartão de crédito</option>
                  </select>
                ) : (
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'card' | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none text-sm bg-white"
                    required
                  >
                    <option value="all">PIX e cartão de crédito</option>
                    <option value="pix">Apenas PIX</option>
                    <option value="card">Apenas cartão de crédito</option>
                  </select>
                )}
              </div>

              {paymentError && (
                <p className="text-red-600 text-xs bg-red-50 p-2.5 rounded border border-red-200">
                  {paymentError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmittingPayment}
                className={`w-full py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow text-sm ${isSubmittingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmittingPayment ? 'Gerando...' : 'Gerar link'}
              </button>
            </form>
          </div>

          {/* List Column */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-display font-bold text-primary mb-4">Links gerados</h2>

            {isPaymentsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : payments.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">Nenhum link de pagamento gerado ainda. Use o formulário ao lado.</p>
            ) : (
              <div className="space-y-4">
                {payments.map((p) => {
                  const pUrl = getPaymentUrl(p.id);
                  const isCopied = !!copiedLinkMap[p.id];
                  return (
                    <div key={p.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-gray-200 transition-colors">
                      <div className="space-y-1 max-w-md">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded">ID: {p.id}</span>
                          <span className="text-[10px] text-gray-700 font-bold">Cliente: {p.clientName}</span>
                          {p.billingType === 'recurrent' ? (
                            <span className="bg-green-100 text-green-800 text-[9px] font-bold px-2 py-0.5 rounded border border-green-200">
                              Assinatura Mensal
                            </span>
                          ) : (
                            <span className="bg-secondary/15 text-primary text-[9px] font-bold px-2 py-0.5 rounded">
                              {p.method === 'pix' ? 'PIX' : p.method === 'card' ? 'Cartão' : 'PIX ou cartão'}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400">
                            • {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight pt-1">{p.description}</h4>
                        <p className="text-xs font-bold text-primary">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)}
                          {p.billingType === 'recurrent' && <span className="text-[10px] text-gray-500 font-normal ml-0.5">/ mês</span>}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(p.id, pUrl)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                            isCopied 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-white text-primary border-primary/20 hover:bg-secondary/10'
                          }`}
                        >
                          {isCopied ? 'Copiado!' : 'Copiar link'}
                        </button>
                        <button
                          onClick={() => handleDeletePayment(p.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
                          title="Excluir link"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
