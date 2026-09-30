import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const empresaId = Number(id);

  if (Number.isNaN(empresaId)) {
    return NextResponse.json(
      ({ message: 'ID inválido' }),
      { status: 400 }
    );
  }

  const [rows]: any = await db.query(
    `
    SELECT
      e.id,
      e.nome AS name,
      e.cnpj AS cnpj,
      e.prioridade AS prioridade,
      DATE_FORMAT(e.data_inicio_prioridade, '%Y-%m-%d') AS data_inicio_prioridade,
      DATE_FORMAT(e.data_fim_prioridade, '%Y-%m-%d') AS data_fim_prioridade,
      (
        e.prioridade = '1'
        AND (e.data_inicio_prioridade IS NULL OR e.data_inicio_prioridade <= CURDATE())
        AND (e.data_fim_prioridade IS NULL OR e.data_fim_prioridade >= CURDATE())
      ) AS prioridade_ativa,
      e.created_at AS created_at
    FROM empresas e
    WHERE e.id = ?
    LIMIT 1
    `,
    [empresaId]
  );

  if (!rows.length) {
    return NextResponse.json(
      { message: 'Empresa não encontrada' },
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
  const empresaId = Number(id);

  if (Number.isNaN(empresaId)) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  }

  const body = await req.json();
  const { name, cnpj, prioridade, data_inicio_prioridade, data_fim_prioridade } = body;
  const inicio = data_inicio_prioridade || null;
  const fim = data_fim_prioridade || null;

  if (inicio && fim && fim < inicio) {
    return NextResponse.json(
      { message: "A data fim não pode ser anterior à data início" },
      { status: 400 }
    );
  }

  try {
    if (typeof name !== "undefined") {

      await db.query(
        `UPDATE empresas SET nome = ? WHERE id = ?`,
        [name, empresaId]
      );
    }

    if (typeof cnpj !== "undefined") {
        await db.query(`UPDATE empresas SET cnpj = ? WHERE id = ?`, [cnpj, empresaId]);
    }

    if (typeof prioridade !== "undefined") {
      const ligado = String(prioridade) === '1';
      await db.query(
        `UPDATE empresas 
        SET prioridade = ?, data_inicio_prioridade = ?, data_fim_prioridade = ?
        WHERE id = ?`,
        [ligado ? '1' : '0', ligado ? inicio : null, ligado ? fim : null, empresaId]
      );
    }

    return NextResponse.json({ message: "Cadastro atualizado com sucesso" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao atualizar cadastro" },
      { status: 500 }
    );
  }
}
