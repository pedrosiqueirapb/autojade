import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/auth';
import { getAutomations, createAutomation, updateAutomation, deleteAutomation } from '@/lib/db';

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

export async function GET() {
  try {
    const automations = await getAutomations();
    return NextResponse.json(automations);
  } catch (error) {
    console.error("API GET Automations Error:", error);
    return NextResponse.json({ error: 'Failed to fetch automations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: 'Não autorizado. Por favor, faça login.' }, { status: 401 });
    }

    const { num, title, desc } = await request.json();

    if (!num || !title || !desc) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes (num, title, desc).' }, { status: 400 });
    }

    const newAuto = await createAutomation(num, title, desc);
    return NextResponse.json(newAuto, { status: 201 });
  } catch (error) {
    console.error("API POST Automation Error:", error);
    return NextResponse.json({ error: 'Failed to create automation' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: 'Não autorizado. Por favor, faça login.' }, { status: 401 });
    }

    const { id, num, title, desc } = await request.json();

    if (!id || !num || !title || !desc) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes (id, num, title, desc).' }, { status: 400 });
    }

    const updatedAuto = await updateAutomation(id, num, title, desc);
    if (!updatedAuto) {
      return NextResponse.json({ error: 'Módulo de automação não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(updatedAuto);
  } catch (error) {
    console.error("API PUT Automation Error:", error);
    return NextResponse.json({ error: 'Failed to update automation' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID do módulo de automação não fornecido.' }, { status: 400 });
    }

    const success = await deleteAutomation(id);
    if (!success) {
      return NextResponse.json({ error: 'Módulo de automação não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Módulo de automação excluído com sucesso.' });
  } catch (error) {
    console.error("API DELETE Automation Error:", error);
    return NextResponse.json({ error: 'Failed to delete automation' }, { status: 500 });
  }
}
