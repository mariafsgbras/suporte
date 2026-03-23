import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  if (session.user.role === "cliente") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const chamadoId = Number(id);

  const [comentarios]: any = await db.query(
    'SELECT COUNT(*) as total FROM comentarios WHERE chamado_id = ?',
    [chamadoId]
  );

  if (comentarios[0].total === 0) {
    return NextResponse.json(
        { message: 'É obrigatório adicionar ao menos um comentário para encerrar o chamado' },
        { status: 400 }
    );
  }

  await db.query(
    `
    UPDATE chamados
    SET
      status = 'closed',
      closed_at = NOW()
    WHERE id = ? AND status = 'in_progress'
    `,
    [chamadoId]
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
      p.nome AS product,
      c.descricao AS description,
      c.status,
      c.created_at AS opened_at,
      c.updated_at,
      c.closed_at,
      t.tipo AS atendimento_tipo
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

  return NextResponse.json(rows[0]);
}
