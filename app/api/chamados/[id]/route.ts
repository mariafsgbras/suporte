import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: 'Não autenticado' },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const chamadoId = Number(id);

  if (Number.isNaN(chamadoId)) {
    return new Response(
      JSON.stringify({ message: 'ID inválido' }),
      { status: 400 }
    );
  }

  const [rows]: any = await db.query(
    `
    SELECT
      c.id,
      e.nome AS company,
      e.cnpj AS cnpj,
      s.nome AS requester,
      s.email AS requester_email,
      s.telefone AS requester_phone,
      r.nome AS responsible,
      p.nome AS product,
      c.descricao AS description,
      c.status,
      c.created_at AS opened_at,
      c.closed_at
    FROM chamados c
    JOIN empresas e ON e.id = c.empresa_id
    JOIN solicitantes s ON s.id = c.solicitante_id
    LEFT JOIN usuarios r ON r.id = c.responsavel_id
    JOIN produtos p ON p.id = c.produto_id
    WHERE c.id = ?
    LIMIT 1
    `,
    [chamadoId]
  );

  if (!rows.length) {
    return NextResponse.json(
      { message: 'Chamado não encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json(rows[0]);
}
