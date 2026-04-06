import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const inicio = searchParams.get('inicio');
    const fim = searchParams.get('fim');
    const empresa = searchParams.get('empresa');
    const responsavel = searchParams.get('responsavel');
    const produto = searchParams.get('produto');
    const status = searchParams.get('status');

    if (!inicio || !fim) {
      return NextResponse.json(
        { error: 'Parâmetros de data são obrigatórios' },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      `
      SELECT 
        c.id,
        e.nome AS empresa,
        p.nome AS produto,
        u.nome AS responsavel,
        c.status,
        c.created_at,
        c.updated_at,
        c.closed_at,
        SEC_TO_TIME(TIMESTAMPDIFF(SECOND, c.created_at, c.updated_at)) AS tempo_inicio,
        SEC_TO_TIME(TIMESTAMPDIFF(SECOND, c.updated_at, c.closed_at)) AS tempo_final,
        SEC_TO_TIME(TIMESTAMPDIFF(SECOND, c.created_at, c.closed_at)) AS tempo_total
      FROM chamados c
      LEFT JOIN usuarios u ON u.id = c.responsavel_id
      LEFT JOIN empresas e ON e.id = c.empresa_id
      LEFT JOIN solicitantes s ON s.id = c.solicitante_id
      LEFT JOIN produtos p ON p.id = c.produto_id
      WHERE e.nome like ?
      AND u.nome like ?
      AND p.nome like ?
      AND DATE(c.created_at) BETWEEN ? AND ?
      AND (? = '' OR c.status = ?)
      ORDER BY e.nome DESC
      `,
      [`%${empresa}%`, `%${responsavel}%`, `%${produto}%`, inicio, fim, status, status]
    );

    const formatted = rows.map((row: any) => ({
      ...row,
      tempo_inicio: row.tempo_inicio ?? 0,
      tempo_final: row.tempo_final ?? 0,
      tempo_total: row.tempo_total ?? 0
    }));

    return NextResponse.json(formatted);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}