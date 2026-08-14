import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/auth';
import { getProjects, createProject, deleteProject, updateProject } from '@/lib/db';

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

function validateBase64Image(base64Str: string): { valid: boolean; error?: string } {
  if (!base64Str) return { valid: true };
  if (base64Str.startsWith('http') || base64Str.startsWith('/')) {
    return { valid: true }; // Image URL/Path is fine
  }
  
  // Format check: data:image/[type];base64,[data]
  const match = base64Str.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  if (!match) {
    return { valid: false, error: 'Formato de imagem inválido. Use um formato de imagem válido (JPEG, PNG, WEBP).' };
  }
  
  const mimeType = match[1];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedMimeTypes.includes(mimeType)) {
    return { valid: false, error: 'Tipo de imagem não suportado. Use apenas JPEG, PNG ou WEBP.' };
  }
  
  // Base64 size estimation
  const base64Data = base64Str.substring(base64Str.indexOf(',') + 1);
  const sizeInBytes = base64Data.length * 0.75;
  const maxSizeBytes = 2 * 1024 * 1024; // 2MB
  
  if (sizeInBytes > maxSizeBytes) {
    return { valid: false, error: 'A imagem excedeu o limite máximo de tamanho de 2MB.' };
  }
  
  return { valid: true };
}

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("API GET Projects Error:", error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: 'Não autorizado. Por favor, faça login.' }, { status: 401 });
    }

    const { title, description, image } = await request.json();
    
    if (!title || !description || !image) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    // Validate uploaded image payload size and format
    const imgValidation = validateBase64Image(image);
    if (!imgValidation.valid) {
      return NextResponse.json({ error: imgValidation.error }, { status: 400 });
    }

    const newProject = await createProject(title, description, image);
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("API POST Project Error:", error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: 'Não autorizado. Por favor, faça login.' }, { status: 401 });
    }

    const { id, title, description, image } = await request.json();
    
    if (!id || !title || !description) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    // Validate uploaded image if supplied
    if (image) {
      const imgValidation = validateBase64Image(image);
      if (!imgValidation.valid) {
        return NextResponse.json({ error: imgValidation.error }, { status: 400 });
      }
    }

    const updated = await updateProject(id, title, description, image);
    if (!updated) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("API PUT Project Error:", error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: 'Não autorizado. Por favor, faça login.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // Body was empty or invalid JSON
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'ID do projeto não fornecido.' }, { status: 400 });
    }

    const success = await deleteProject(id);
    if (!success) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Projeto excluído com sucesso.' });
  } catch (error) {
    console.error("API DELETE Project Error:", error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
