import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; 
  const session = await getServerSession(authOptions);

  console.log('ID:', id);
  console.log('USER:', session?.user);
  
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
  }

  if (session.user.role === "cliente") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const chamadoId = Number(id);

  if (Number.isNaN(chamadoId)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
  }

  const { mensagem } = await req.json();

  if (!mensagem || !mensagem.trim()) {
    return NextResponse.json(
      { message: 'Comentário é obrigatório' },
      { status: 400 }
    );
  }

  console.log('BODY:', mensagem);

  await db.query(
    `
    INSERT INTO comentarios (chamado_id, usuario_id, mensagem)
    VALUES (?, ?, ?)
    `,
    [chamadoId, session.user.id, mensagem]
  );

  return NextResponse.json({ success: true });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const chamadoId = Number(id);

  const [rows]: any = await db.query(
    `
    SELECT
      c.id,
      c.mensagem,
      c.created_at,
      u.nome AS autor
    FROM comentarios c
    JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.chamado_id = ?
    ORDER BY c.created_at ASC
    `,
    [chamadoId]
  );

  return NextResponse.json(rows);
}
