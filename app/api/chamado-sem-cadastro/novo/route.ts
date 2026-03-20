import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const {
      empresa_id,
      nome,
      email,
      telefone,
      product,
      description
    } = await req.json();

    if (!empresa_id || !nome || !email || !product || !description) {
      return NextResponse.json(
        { message: 'Dados obrigatórios não informados' },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      `
      SELECT id FROM solicitantes
      WHERE empresa_id = ? AND email = ?
      LIMIT 1
      `,
      [empresa_id, email]
    );

    let solicitante_id;

    if (rows.length) {
      solicitante_id = rows[0].id;

      await db.query(
        `
        UPDATE solicitantes
        SET
          nome = ?,
          telefone = ?,
          updated_at = NOW()
        WHERE id = ?
        `,
        [nome, telefone, solicitante_id]
      );
    } else {
      const [result]: any = await db.query(
        `
        INSERT INTO solicitantes (
          empresa_id, nome, email, telefone, created_at, updated_at
        ) VALUES (?, ?, ?, ?, NOW(), NOW())
        `,
        [empresa_id, nome, email, telefone || null]
      );

      solicitante_id = result.insertId;
    }

    const [chamadoResult]: any = await db.query(
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
      id: chamadoResult.insertId,
      message: 'Chamado aberto com sucesso',
    });

  } catch (error) {
    console.error('Erro ao abrir chamado:', error);

    return NextResponse.json(
      { message: 'Erro ao abrir chamado' },
      { status: 500 }
    );
  }
}