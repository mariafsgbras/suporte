import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  const { classificacao_id, responsavel_id } = body;
  
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

  if (!classificacao_id && !responsavel_id) {
    return NextResponse.json(
      { message: "Nada para atualizar" },
      { status: 400 }
    );
  }

  console.log(classificacao_id, responsavel_id);

  const updates: string[] = [];
  const values: any[] = [];

  console.log('VALORES RECEBIDOS:', {
    classificacao_id,
    responsavel_id
  });

  if (
    responsavel_id !== undefined &&
    responsavel_id !== null &&
    responsavel_id !== ''
  ) {
    updates.push('responsavel_id = ?');
    values.push(Number(responsavel_id));
  }

  if (
    classificacao_id !== undefined &&
    classificacao_id !== null &&
    classificacao_id !== ''
  ) {
    updates.push('classificacao_id = ?');
    values.push(Number(classificacao_id));
  }

  if (updates.length === 0) {
    return NextResponse.json(
      { message: "Nada para atualizar" },
      { status: 400 }
    );
  }

  values.push(chamadoId);

  console.log('QUERY FINAL:', updates, values);

  console.log('BODY RAW:', body);
  await db.query(
    `
    UPDATE chamados
    SET ${updates.join(', ')}
    WHERE id = ?
    `,
    values
  );

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
      c.responsavel_id,
      p.nome AS product,
      c.descricao AS description,
      c.status,
      c.created_at AS opened_at,
      c.updated_at,
      c.closed_at,
      t.tipo AS atendimento_tipo,
      c.classificacao_id
    FROM chamados c
    JOIN empresas e ON e.id = c.empresa_id
    JOIN solicitantes s ON s.id = c.solicitante_id
    LEFT JOIN usuarios r ON r.id = c.responsavel_id
    JOIN produtos p ON p.id = c.produto_id
    LEFT JOIN classificacao t ON t.id = c.classificacao_id
    WHERE c.id = ?
    `,
    [chamadoId]
  );

  console.log(rows[0]);
  return NextResponse.json(rows[0]);
}
