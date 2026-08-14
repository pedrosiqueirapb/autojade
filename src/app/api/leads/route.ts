import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/auth';

// Simple in-memory rate limiting for lead submissions
// Key: IP, Value: { count: number, resetTime: number }
const leadsRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = leadsRateLimitMap.get(ip);

  if (!limit) {
    leadsRateLimitMap.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 }); // 15 mins window
    return false;
  }

  if (now > limit.resetTime) {
    // Reset window
    leadsRateLimitMap.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    return false;
  }

  if (limit.count >= 5) {
    // Limit to 5 requests per 15 minutes
    return true;
  }

  limit.count += 1;
  leadsRateLimitMap.set(ip, limit);
  return false;
}

function sanitize(text: string): string {
  if (!text) return '';
  // Remove HTML tags to prevent XSS
  return text.replace(/<[^>]*>/g, '').trim();
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 100;
}

export async function POST(request: Request) {
  const ip = await getClientIp();

  try {
    // 1. Rate Limiting Check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Muitas solicitações enviadas a partir deste IP. Por favor, aguarde 15 minutos.' },
        { status: 429 }
      );
    }

    const payload = await request.json();
    const { companyName, contactName, email, phone, services, website_url_honeypot } = payload;

    // 2. Honeypot check for bots
    if (website_url_honeypot) {
      console.warn(`Spambot detected from IP ${ip} (Honeypot filled: "${website_url_honeypot}")`);
      // Return a fake success response to trick the bot into stopping further attacks
      return NextResponse.json({
        success: true,
        message: 'Lead captured successfully (local webhook fallback)!',
        timestamp: new Date().toISOString()
      });
    }

    // 3. Validation & Sanitization
    const sanitizedCompanyName = sanitize(companyName);
    const sanitizedContactName = sanitize(contactName);
    const sanitizedEmail = sanitize(email);
    const sanitizedPhone = sanitize(phone);

    if (!sanitizedCompanyName || !sanitizedContactName || !sanitizedEmail || !sanitizedPhone) {
      return NextResponse.json({ error: 'Todos os campos obrigatórios (*) devem ser preenchidos.' }, { status: 400 });
    }

    if (sanitizedCompanyName.length > 100 || sanitizedContactName.length > 100) {
      return NextResponse.json({ error: 'Os campos de texto excederam o limite máximo de caracteres (100).' }, { status: 400 });
    }

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Por favor, forneça um endereço de e-mail corporativo válido.' }, { status: 400 });
    }

    if (sanitizedPhone.length < 8 || sanitizedPhone.length > 25) {
      return NextResponse.json({ error: 'Por favor, forneça um número de telefone válido.' }, { status: 400 });
    }

    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json({ error: 'Selecione pelo menos um serviço de seu interesse.' }, { status: 400 });
    }

    const serviceMapping: { [key: string]: string } = {
      'Automacao': 'AUTOMACAO',
      'AUTOMACAO': 'AUTOMACAO',
      'Web': 'WEB',
      'WEB': 'WEB',
      'ConteudoVisual': 'CONTEUDO_VISUAL',
      'CONTEUDO_VISUAL': 'CONTEUDO_VISUAL'
    };
    const sanitizedServices = services
      .map(s => sanitize(s))
      .filter(s => serviceMapping[s] !== undefined)
      .map(s => serviceMapping[s]);
      
    if (sanitizedServices.length === 0) {
      return NextResponse.json({ error: 'Serviços selecionados inválidos.' }, { status: 400 });
    }

    // Formulate clean parsed data
    const leadData = {
      companyName: sanitizedCompanyName,
      contactName: sanitizedContactName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      services: sanitizedServices,
      submittedAt: new Date().toISOString(),
      clientIp: ip
    };

    console.log("Captured Secure Lead Payload:", JSON.stringify(leadData, null, 2));

    // Determine the n8n Webhook URL to use based on the environment configuration
    const n8nMode = process.env.N8N_WEBHOOK_MODE || 'test';
    const n8nWebhookUrl = n8nMode === 'production'
      ? process.env.N8N_WEBHOOK_PROD_URL
      : process.env.N8N_WEBHOOK_TEST_URL;

    if (n8nWebhookUrl) {
      try {
        const n8nPayload = {
          empresa: leadData.companyName,
          nome: leadData.contactName,
          email: leadData.email,
          telefone: leadData.phone,
          servicos: leadData.services
        };

        const webhookResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(n8nPayload)
        });

        if (!webhookResponse.ok) {
          const webhookErrText = await webhookResponse.text();
          console.error(`n8n Webhook returned error: ${webhookResponse.status} - ${webhookErrText}`);
          return NextResponse.json(
            { error: 'Erro ao enviar dados para a plataforma de automação.' },
            { status: 502 }
          );
        }
      } catch (err) {
        console.error("Failed to dispatch webhook to n8n:", err);
        return NextResponse.json(
          { error: 'Falha na conexão com o serviço de integração.' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Lead Capturing Error:", error);
    // Avoid leaking stack traces in response error messages
    return NextResponse.json({ error: 'Erro ao processar os dados do formulário.' }, { status: 500 });
  }
}
