import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/auth';
import { getPayments, getPaymentById, createPayment, deletePayment } from '@/lib/db';
import { generatePixPayload } from '@/lib/pix';
import { createAsaasPayment } from '@/lib/asaas';

async function isAuthorized(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('autojade_session')?.value;
    if (!token) return false;
    return await validateSession(token);
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // If ID is provided, it is a public request to load a specific payment link's details
    if (id) {
      const payment = await getPaymentById(id);
      if (!payment) {
        return NextResponse.json({ error: 'Link de pagamento não encontrado' }, { status: 404 });
      }

      const pixKey = process.env.PIX_KEY || '5511999999999';
      const pixName = process.env.PIX_NAME || 'Autojade Enterprise';
      const pixCity = process.env.PIX_CITY || 'Sao Paulo';
      const pixCode = generatePixPayload(pixKey, pixName, pixCity, payment.value, payment.id);

      return NextResponse.json({
        ...payment,
        pixCode
      });
    }

    // Otherwise, require session auth to list all generated links
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: 'Não autorizado. Por favor, faça login.' }, { status: 401 });
    }

    const payments = await getPayments();
    return NextResponse.json(payments);
  } catch (error) {
    console.error("API GET Payments Error:", error);
    return NextResponse.json({ error: 'Failed to process payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: 'Não autorizado. Por favor, faça login.' }, { status: 401 });
    }

    const { description, value, clientName, method } = await request.json();
    
    if (!description || typeof value !== 'number' || !clientName) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    if (value <= 0) {
      return NextResponse.json({ error: 'O valor da cobrança deve ser um número positivo maior que zero.' }, { status: 400 });
    }

    const validatedMethod = (method === 'pix' || method === 'card' || method === 'all') ? method : 'all';

    let cardUrl = undefined;
    if (validatedMethod === 'card' || validatedMethod === 'all') {
      try {
        cardUrl = await createAsaasPayment(clientName, description, value);
      } catch (err) {
        console.error("Failed to generate Asaas billing link:", err);
        const errMsg = err instanceof Error ? err.message : 'Falha ao integrar com o gateway Asaas. Por favor, verifique suas configurações de API.';
        return NextResponse.json({ error: errMsg }, { status: 500 });
      }
    }

    const newPayment = await createPayment(description, value, clientName, validatedMethod, cardUrl);
    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error("API POST Payment Error:", error);
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: 'Não autorizado. Por favor, faça login.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do link de pagamento não fornecido.' }, { status: 400 });
    }

    const success = await deletePayment(id);
    if (!success) {
      return NextResponse.json({ error: 'Link de pagamento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Link de pagamento excluído com sucesso.' });
  } catch (error) {
    console.error("API DELETE Payment Error:", error);
    return NextResponse.json({ error: 'Failed to delete payment link' }, { status: 500 });
  }
}
