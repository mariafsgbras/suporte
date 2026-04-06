import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { empresa_id, nome, email, telefone, senha } = await req.json();
  
    if (!empresa_id || !nome || !email || !senha) {
      return NextResponse.json(
        { message: 'Dados obrigatórios não informados' },
        { status: 400 }
      );
    }

    console.log('info:', empresa_id, nome, email, telefone);
    console.log('senha:', senha);
    const senha_hash = await bcrypt.hash(senha, 10);
    console.log('senha hash:', senha_hash);

    const [existing]: any = await db.query(
      `
      SELECT id
      FROM usuarios
      WHERE empresa_id = ? AND email = ?
      LIMIT 1
      `,
      [empresa_id, email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: 'Usuário já cadastrado' },
        { status: 409 }
      );
    }

    const [result]: any = await db.query(
      `
      INSERT INTO usuarios (
        empresa_id,
        nome,
        email,
        telefone,
        senha_hash,
        role,
        created_at
      ) VALUES (?, ?, ?, ?, ?, 'cliente', NOW())
      `,
      [empresa_id, nome, email, telefone, senha_hash]
    );

    const usuario_id = result.insertId;

    const [[solicitante]]: any = await db.query(
      `
      SELECT id
      FROM solicitantes
      WHERE empresa_id = ?
      AND email = ?
      LIMIT 1
      `,
      [empresa_id, email]
    );

    if (solicitante) {
      await db.query(
        `
        UPDATE solicitantes
        SET 
          usuario_id = ?,
          nome = CASE
            WHEN TRIM(nome) = '' OR nome IS NULL THEN ?
            ELSE nome
          END,
          telefone = COALESCE(telefone, ?)
        WHERE id = ?
        `,
        [usuario_id, nome, telefone, solicitante.id]
      );
    } else {
      await db.query(
        `
        INSERT INTO solicitantes (
          empresa_id,
          usuario_id,
          nome,
          email,
          telefone,
          created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
        `,
        [empresa_id, usuario_id, nome, email, telefone]
      );
    }

    return NextResponse.json({
      id: result.insertId,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Erro ao criar usuário. Email já cadastrado.' },
      { status: 500 }
    );
  }
}
