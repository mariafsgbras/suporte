import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { product, description } = await req.json();

    if (!product || !description) {
      return NextResponse.json(
        { message: 'Produto e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    const empresa_id = session.user.empresa_id;
    const usuario_id = Number(session.user.id);

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
        created_at
      ) VALUES (?, ?, ?, NULL, 'open', ?, NOW())
      `,
      [
        empresa_id,
        product,
        solicitante_id,
        description,
      ]
    );

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
