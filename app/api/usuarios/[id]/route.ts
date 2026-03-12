import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = Number(id);

  if (Number.isNaN(userId)) {
    return new Response(
      JSON.stringify({ message: 'ID inválido' }),
      { status: 400 }
    );
  }

  const [rows]: any = await db.query(
    `
    SELECT
      u.id,
      u.nome AS name,
      u.email AS email,
      u.telefone AS phone,
      u.ativo AS active,
      u.role AS role,
      u.created_at AS created_at,
      u.updated_at AS updated_at,
      e.nome AS company
    FROM usuarios u
    JOIN empresas e ON e.id = u.empresa_id
    WHERE u.id = ?
    LIMIT 1
    `,
    [id]
  );

  if (!rows.length) {
    return NextResponse.json(
      { message: 'Usuário não encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json(rows[0]);
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = Number(id);

  if (Number.isNaN(userId)) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  }

  const body = await req.json();
  const { resetPassword, active } = body;
  console.log("BODY:", body);

  try {
    if (resetPassword === true) {
      const hashedPassword = await bcrypt.hash("123456", 10);

      await db.query(
        `UPDATE usuarios SET senha_hash = ?, updated_at = NOW() WHERE id = ?`,
        [hashedPassword, userId]
      );
    }

    if (typeof active !== "undefined") {
      await db.query(
        `UPDATE usuarios SET ativo = ?, updated_at = NOW() WHERE id = ?`,
        [active, userId]
      );
    }

    return NextResponse.json({ message: "Usuário atualizado com sucesso" });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}
