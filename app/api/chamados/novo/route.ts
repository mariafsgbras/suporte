import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendNewTicketEmail } from '@/lib/sendNewTicketEmail';

export async function POST(req: Request) {

  // Desenvolvimento e Suporte
  const [admins]: any = await db.query(`
    SELECT email
    FROM usuarios
    WHERE role IN ('admin', 'atendente')
      AND ativo = 1
      AND id IN (1, 2, 3, 5, 6, 264)
  `);

  const emails = admins.map((u: any) => u.email);

  // Apenas Desenvolvimento
  /*const [admins]: any = await db.query(`
    SELECT email
    FROM usuarios
    WHERE role IN ('admin')
      AND ativo = 1
      AND id <> 4
  `);

  const emails = admins.map((u: any) => u.email);*/

  //const emails = 'maria.fernanda.rabelo@sgbras.com'

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { product, description, priority } = await req.json();

    if (!product || !description) {
      return NextResponse.json(
        { message: 'Produto e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    const empresa_id = session.user.empresa_id;
    const usuario_id = Number(session.user.id);

    const [[empresa]]: any = await db.query(
      `SELECT (
        prioridade = '1'
        AND (data_inicio_prioridade IS NULL OR data_inicio_prioridade <= CURDATE())
        AND (data_fim_prioridade IS NULL OR data_fim_prioridade >= CURDATE())
      ) AS ativa
      FROM empresas WHERE id = ? LIMIT 1`,
      [empresa_id]
    );
    const prioridade = priority === true && empresa?.ativa ? '1' : '0';

    const [[solicitante]]: any = await db.query(
      `SELECT id FROM solicitantes WHERE usuario_id = ? LIMIT 1`,
      [usuario_id]
    );

    if (!solicitante) {
      return NextResponse.json(
        { message: 'Solicitante não encontrado para este usuário' },
        { status: 400 }
      );
    }

    const solicitante_id = solicitante.id;

    const [result]: any = await db.query(
      `
      INSERT INTO chamados (
        empresa_id,
        produto_id,
        solicitante_id,
        responsavel_id,
        status,
        descricao,
        prioridade,
        created_at
      ) VALUES (?, ?, ?, NULL, 'open', ?, ?, NOW())
      `,
      [
        empresa_id,
        product,
        solicitante_id,
        description,
        prioridade
      ]
    );

    const chamadoId = result.insertId;

    const [[chamado]]: any = await db.query(
      `
      SELECT
        c.id,
        c.descricao,
        c.prioridade,
        c.created_at,
        p.nome AS produto
      FROM chamados c
      JOIN produtos p ON p.id = c.produto_id
      WHERE c.id = ?
      `,
      [chamadoId]
    );

    if (chamado.prioridade === "1") {
      sendNewTicketEmail({
        emails,
        chamadoId,
        empresa: session.user.empresa_nome ?? "",
        solicitante: session.user.name ?? "",
        telefone: session.user.phone ?? "",
        email: session.user.email ?? "",
        produto: chamado.produto,
        descricao: chamado.descricao,
        prioridade: true,
        data: chamado.created_at,
      }).catch(console.error);
    }

    return NextResponse.json({
      id: result.insertId,
      message: 'Chamado criado com sucesso',
    });

  } catch (error) {
    console.error('Erro ao criar chamado:', error);

    return NextResponse.json(
      { message: 'Erro ao criar chamado' },
      { status: 500 }
    );
  }
}
