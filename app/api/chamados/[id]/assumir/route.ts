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

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
  }

  if (session.user.role === "cliente") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const chamadoId = Number(id);

  if (Number.isNaN(chamadoId)) {
    return NextResponse.json(
      { message: "ID do chamado inválido" },
      { status: 400 }
    );
  }

  await db.query(
    `
    UPDATE chamados
    SET
      responsavel_id = ?,
      status = 'in_progress',
      updated_at = NOW()
    WHERE id = ? AND status = 'open'
    `,
    [session.user.id, chamadoId]
  );

  const [rows]: any = await db.query(
    `
    SELECT
      c.id,
      e.nome AS company,
      s.nome AS requester,
      s.email AS requester_email,
      s.telefone AS requester_phone,
      r.nome AS responsible,
      p.nome AS product,
      c.descricao AS description,
      c.status,
      c.created_at AS opened_at,
      c.updated_at,
      c.closed_at
    FROM chamados c
    JOIN empresas e ON e.id = c.empresa_id
    JOIN solicitantes s ON s.id = c.solicitante_id
    LEFT JOIN usuarios r ON r.id = c.responsavel_id
    JOIN produtos p ON p.id = c.produto_id
    WHERE c.id = ?
    `,
    [chamadoId]
  );

  return NextResponse.json(rows[0]);
}
