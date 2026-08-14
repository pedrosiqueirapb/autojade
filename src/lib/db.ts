import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { encryptText, decryptText } from './crypto';

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string; // Base64 or URL
  createdAt: string;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const useSupabase = !!(supabaseUrl && supabaseAnonKey);

const supabase = useSupabase ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

const LOCAL_FILE_PATH = path.join(process.cwd(), 'src/data/projects.json');

// Helper to ensure the local JSON file exists with mock items if empty
async function ensureLocalFile() {
  try {
    await fs.mkdir(path.dirname(LOCAL_FILE_PATH), { recursive: true });
    await fs.access(LOCAL_FILE_PATH);
  } catch {
    const initialMocks: Project[] = [
      {
        id: "mock-1",
        title: "Central de Relacionamento Inteligente",
        description: "Módulo de IA com atendimento humanizado 24/7 integrado ao WhatsApp. Qualifica leads, responde dúvidas frequentes e realiza agendamentos automaticamente, eliminando o tempo de espera do cliente final.",
        image: "/logo.jpg",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
      },
      {
        id: "mock-2",
        title: "Landing Page de Alta Conversão para Clínicas",
        description: "Desenvolvimento web responsivo com carregamento ultra-rápido, otimização de SEO de ponta e interface com gatilhos de conversão para agendamentos imediatos de consultas.",
        image: "/logo.jpg",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 24 hours ago
      },
      {
        id: "mock-3",
        title: "Campanha de Vídeo Anúncios para Varejo",
        description: "Criação de criativos e anúncios em vídeo de alta qualidade focados no público-alvo, gerando engajamento e tração para campanhas de tráfego pago nas redes sociais.",
        image: "/logo.jpg",
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString() // 48 hours ago
      }
    ];
    await fs.writeFile(LOCAL_FILE_PATH, JSON.stringify(initialMocks, null, 2), 'utf-8');
  }
}

export async function getProjects(): Promise<Project[]> {
  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.warn("Supabase error, falling back to local storage:", error);
        return getLocalProjects();
      }
      return data || [];
    } catch (e) {
      console.warn("Supabase exception, falling back to local storage:", e);
      return getLocalProjects();
    }
  } else {
    return getLocalProjects();
  }
}

async function getLocalProjects(): Promise<Project[]> {
  await ensureLocalFile();
  try {
    const data = await fs.readFile(LOCAL_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to read local projects:", e);
    return [];
  }
}

export async function createProject(title: string, description: string, image: string): Promise<Project> {
  const newProject: Project = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
    title,
    description,
    image,
    createdAt: new Date().toISOString()
  };

  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select();
      
      if (error) {
        console.warn("Supabase error creating project, falling back to local:", error);
        return saveLocalProject(newProject);
      }
      return data[0];
    } catch (e) {
      console.warn("Supabase exception creating project, falling back to local:", e);
      return saveLocalProject(newProject);
    }
  } else {
    return saveLocalProject(newProject);
  }
}

async function saveLocalProject(project: Project): Promise<Project> {
  await ensureLocalFile();
  const projects = await getLocalProjects();
  projects.unshift(project);
  await fs.writeFile(LOCAL_FILE_PATH, JSON.stringify(projects, null, 2), 'utf-8');
  return project;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (useSupabase && supabase) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.warn("Supabase error deleting project, falling back to local:", error);
        return deleteLocalProject(id);
      }
      return true;
    } catch (e) {
      console.warn("Supabase exception deleting project, falling back to local:", e);
      return deleteLocalProject(id);
    }
  } else {
    return deleteLocalProject(id);
  }
}

async function deleteLocalProject(id: string): Promise<boolean> {
  await ensureLocalFile();
  const projects = await getLocalProjects();
  const filtered = projects.filter(p => p.id !== id);
  if (filtered.length === projects.length) return false;
  await fs.writeFile(LOCAL_FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
  return true;
}

export async function updateProject(id: string, title: string, description: string, image?: string): Promise<Project | null> {
  if (useSupabase && supabase) {
    try {
      const updates: { title: string; description: string; image?: string } = { title, description };
      if (image) updates.image = image;
      
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.warn("Supabase error updating project, falling back to local:", error);
        return updateLocalProject(id, title, description, image);
      }
      return data[0] || null;
    } catch (e) {
      console.warn("Supabase exception updating project, falling back to local:", e);
      return updateLocalProject(id, title, description, image);
    }
  } else {
    return updateLocalProject(id, title, description, image);
  }
}

async function updateLocalProject(id: string, title: string, description: string, image?: string): Promise<Project | null> {
  await ensureLocalFile();
  const projects = await getLocalProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  projects[index].title = title;
  projects[index].description = description;
  if (image) {
    projects[index].image = image;
  }
  
  await fs.writeFile(LOCAL_FILE_PATH, JSON.stringify(projects, null, 2), 'utf-8');
  return projects[index];
}

export interface Payment {
  id: string;
  clientName: string;
  description: string;
  value: number;
  method?: 'pix' | 'card' | 'all';
  cardUrl?: string;
  createdAt: string;
}

const PAYMENTS_FILE_PATH = path.join(process.cwd(), 'src/data/payments.json');

async function ensureLocalPaymentsFile() {
  try {
    await fs.mkdir(path.dirname(PAYMENTS_FILE_PATH), { recursive: true });
    await fs.access(PAYMENTS_FILE_PATH);
  } catch {
    await fs.writeFile(PAYMENTS_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

export async function getPayments(): Promise<Payment[]> {
  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.warn("Supabase error fetching payments, falling back to local:", error);
        return getLocalPayments();
      }
      return data || [];
    } catch (e) {
      console.warn("Supabase exception fetching payments, falling back to local:", e);
      return getLocalPayments();
    }
  } else {
    return getLocalPayments();
  }
}

async function getLocalPayments(): Promise<Payment[]> {
  await ensureLocalPaymentsFile();
  try {
    const data = await fs.readFile(PAYMENTS_FILE_PATH, 'utf-8');
    const encryptedPayments: Payment[] = JSON.parse(data);
    // Decrypt PII fields on retrieve
    return encryptedPayments.map(p => ({
      ...p,
      clientName: decryptText(p.clientName),
      description: decryptText(p.description)
    }));
  } catch (e) {
    console.error("Failed to read local payments:", e);
    return [];
  }
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const payments = await getPayments();
  return payments.find(p => p.id === id) || null;
}

export async function createPayment(description: string, value: number, clientName: string, method: 'pix' | 'card' | 'all' = 'all', cardUrl?: string): Promise<Payment> {
  const newPayment: Payment = {
    id: 'pay_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)),
    clientName,
    description,
    value,
    method,
    cardUrl,
    createdAt: new Date().toISOString()
  };

  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([newPayment])
        .select();
      
      if (error) {
        console.warn("Supabase error creating payment, falling back to local:", error);
        return saveLocalPayment(newPayment);
      }
      return data[0];
    } catch (e) {
      console.warn("Supabase exception creating payment, falling back to local:", e);
      return saveLocalPayment(newPayment);
    }
  } else {
    return saveLocalPayment(newPayment);
  }
}

async function saveLocalPayment(payment: Payment): Promise<Payment> {
  await ensureLocalPaymentsFile();
  const payments = await getLocalPayments();
  payments.unshift(payment);
  
  // Encrypt PII fields before saving
  const encryptedPayments = payments.map(p => ({
    ...p,
    clientName: encryptText(p.clientName),
    description: encryptText(p.description)
  }));
  
  await fs.writeFile(PAYMENTS_FILE_PATH, JSON.stringify(encryptedPayments, null, 2), 'utf-8');
  return payment;
}

export async function deletePayment(id: string): Promise<boolean> {
  if (useSupabase && supabase) {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.warn("Supabase error deleting payment, falling back to local:", error);
        return deleteLocalPayment(id);
      }
      return true;
    } catch (e) {
      console.warn("Supabase exception deleting payment, falling back to local:", e);
      return deleteLocalPayment(id);
    }
  } else {
    return deleteLocalPayment(id);
  }
}

async function deleteLocalPayment(id: string): Promise<boolean> {
  await ensureLocalPaymentsFile();
  const payments = await getLocalPayments();
  const filtered = payments.filter(p => p.id !== id);
  if (filtered.length === payments.length) return false;
  
  // Encrypt PII fields before saving
  const encryptedPayments = filtered.map(p => ({
    ...p,
    clientName: encryptText(p.clientName),
    description: encryptText(p.description)
  }));
  
  await fs.writeFile(PAYMENTS_FILE_PATH, JSON.stringify(encryptedPayments, null, 2), 'utf-8');
  return true;
}

export interface Automation {
  id: string;
  num: string;
  title: string;
  desc: string;
  createdAt: string;
}

const LOCAL_AUTOMATIONS_FILE_PATH = path.join(process.cwd(), 'src/data/automations.json');

async function ensureLocalAutomationsFile() {
  try {
    await fs.mkdir(path.dirname(LOCAL_AUTOMATIONS_FILE_PATH), { recursive: true });
    await fs.access(LOCAL_AUTOMATIONS_FILE_PATH);
  } catch {
    const initialMocks: Automation[] = [
      {
        id: "auto-1",
        num: "01",
        title: "Atendimento ao cliente 24h",
        desc: "Evite perder vendas por demora no retorno. Seus clientes recebem respostas imediatas para as dúvidas mais comuns a qualquer hora do dia ou da noite, garantindo agilidade no contato e mantendo o interesse de quem procura seus serviços.",
        createdAt: new Date(Date.now() - 3600000 * 9).toISOString()
      },
      {
        id: "auto-2",
        num: "02",
        title: "Acompanhamento de vendas",
        desc: "Aumente as chances de fechar novos negócios sem precisar lembrar de enviar mensagens. O sistema envia avisos e novidades aos interessados de forma automática, ajudando a recuperar clientes que pararam de responder.",
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
      },
      {
        id: "auto-3",
        num: "03",
        title: "Qualificação de interessados",
        desc: "Foque o seu tempo de vendas apenas em quem realmente tem potencial para comprar. O sistema conversa de forma simples com os novos interessados, filtra quem atende aos seus requisitos e envia os dados organizados para a sua equipe.",
        createdAt: new Date(Date.now() - 3600000 * 7).toISOString()
      },
      {
        id: "auto-4",
        num: "04",
        title: "Agendamento de horários",
        desc: "Elimine erros de marcação e a perda de tempo organizando compromissos. Seus clientes escolhem o horário disponível de forma simples e recebem lembretes automáticos, reduzindo drasticamente os esquecimentos e faltas.",
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
      },
      {
        id: "auto-5",
        num: "05",
        title: "Leitura de notas fiscais",
        desc: "Livre sua equipe de digitar notas fiscais e enviar documentos manualmente para o contador. O sistema lê as notas recebidas por e-mail de forma automática, organiza os dados e envia tudo direto para a contabilidade ao fim do mês.",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: "auto-6",
        num: "06",
        title: "Pesquisa ativa de clientes",
        desc: "Mantenha sua equipe comercial sempre abastecida com novas oportunidades. O sistema busca de forma ativa empresas ou clientes com o perfil ideal na internet e inicia o primeiro contato de apresentação do seu negócio.",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: "auto-7",
        num: "07",
        title: "Boas-vindas e satisfação",
        desc: "Melhore a experiência de quem acabou de contratar sua empresa e evite cancelamentos. O sistema guia o novo cliente nos primeiros passos de uso do serviço e solicita avaliações e comentários para garantir a satisfação dele.",
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
      },
      {
        id: "auto-8",
        num: "08",
        title: "Lembretes para eventos",
        desc: "Garanta a presença do público em suas reuniões, treinamentos ou palestras. O sistema cuida de todas as inscrições, confirmações de pagamento e envia avisos personalizados com as principais informações antes do início.",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: "auto-9",
        num: "09",
        title: "Seleção rápida de currículos",
        desc: "Agilize a contratação de novos funcionários para a sua empresa sem perder tempo analisando dezenas de e-mails. O sistema analisa os currículos recebidos, seleciona os melhores perfis e marca a entrevista de forma automática.",
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ];
    await fs.writeFile(LOCAL_AUTOMATIONS_FILE_PATH, JSON.stringify(initialMocks, null, 2), 'utf-8');
  }
}

export async function getAutomations(): Promise<Automation[]> {
  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .order('num', { ascending: true });
      
      if (error) {
        console.warn("Supabase error fetching automations, falling back to local:", error);
        return getLocalAutomations();
      }
      return data || [];
    } catch (e) {
      console.warn("Supabase exception fetching automations, falling back to local:", e);
      return getLocalAutomations();
    }
  } else {
    return getLocalAutomations();
  }
}

async function getLocalAutomations(): Promise<Automation[]> {
  await ensureLocalAutomationsFile();
  try {
    const data = await fs.readFile(LOCAL_AUTOMATIONS_FILE_PATH, 'utf-8');
    const list: Automation[] = JSON.parse(data);
    return list.sort((a, b) => a.num.localeCompare(b.num));
  } catch (e) {
    console.error("Failed to read local automations:", e);
    return [];
  }
}

export async function createAutomation(num: string, title: string, desc: string): Promise<Automation> {
  const newAuto: Automation = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
    num,
    title,
    desc,
    createdAt: new Date().toISOString()
  };

  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('automations')
        .insert([newAuto])
        .select();
      
      if (error) {
        console.warn("Supabase error creating automation, falling back to local:", error);
        return saveLocalAutomation(newAuto);
      }
      return data[0];
    } catch (e) {
      console.warn("Supabase exception creating automation, falling back to local:", e);
      return saveLocalAutomation(newAuto);
    }
  } else {
    return saveLocalAutomation(newAuto);
  }
}

async function saveLocalAutomation(auto: Automation): Promise<Automation> {
  await ensureLocalAutomationsFile();
  const list = await getLocalAutomations();
  list.push(auto);
  await fs.writeFile(LOCAL_AUTOMATIONS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  return auto;
}

export async function updateAutomation(id: string, num: string, title: string, desc: string): Promise<Automation | null> {
  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('automations')
        .update({ num, title, desc })
        .eq('id', id)
        .select();
      
      if (error) {
        console.warn("Supabase error updating automation, falling back to local:", error);
        return updateLocalAutomation(id, num, title, desc);
      }
      return data[0] || null;
    } catch (e) {
      console.warn("Supabase exception updating automation, falling back to local:", e);
      return updateLocalAutomation(id, num, title, desc);
    }
  } else {
    return updateLocalAutomation(id, num, title, desc);
  }
}

async function updateLocalAutomation(id: string, num: string, title: string, desc: string): Promise<Automation | null> {
  await ensureLocalAutomationsFile();
  const list = await getLocalAutomations();
  const index = list.findIndex(a => a.id === id);
  if (index === -1) return null;
  
  list[index].num = num;
  list[index].title = title;
  list[index].desc = desc;
  
  await fs.writeFile(LOCAL_AUTOMATIONS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  return list[index];
}

export async function deleteAutomation(id: string): Promise<boolean> {
  if (useSupabase && supabase) {
    try {
      const { error } = await supabase
        .from('automations')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.warn("Supabase error deleting automation, falling back to local:", error);
        return deleteLocalAutomation(id);
      }
      return true;
    } catch (e) {
      console.warn("Supabase exception deleting automation, falling back to local:", e);
      return deleteLocalAutomation(id);
    }
  } else {
    return deleteLocalAutomation(id);
  }
}

async function deleteLocalAutomation(id: string): Promise<boolean> {
  await ensureLocalAutomationsFile();
  const list = await getLocalAutomations();
  const filtered = list.filter(a => a.id !== id);
  if (filtered.length === list.length) return false;
  await fs.writeFile(LOCAL_AUTOMATIONS_FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
  return true;
}
