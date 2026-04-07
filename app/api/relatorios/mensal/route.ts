import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    if (!month) {
      return NextResponse.json({ error: 'Mês obrigatório' }, { status: 400 });
    }

    const [porResponsavel]: any = await db.query(
      `
      SELECT u.nome AS responsavel, COUNT(*) AS quantidade
      FROM chamados c
      LEFT JOIN usuarios u ON u.id = c.responsavel_id
      WHERE DATE_FORMAT(c.created_at, '%Y-%m') = ? and u.id <> 9
      GROUP BY u.nome
      ORDER BY quantidade DESC
      `,
      [month]
    );

    const [porProduto]: any = await db.query(
      `
      SELECT p.nome AS produto, COUNT(*) AS quantidade
      FROM chamados c
      LEFT JOIN produtos p ON p.id = c.produto_id
      WHERE DATE_FORMAT(c.created_at, '%Y-%m') = ?
      GROUP BY p.nome
      ORDER BY quantidade DESC
      `,
      [month]
    );

    const [[tempos]]: any = await db.query(
      `
      SELECT 
        SEC_TO_TIME(AVG(TIMESTAMPDIFF(SECOND, c.created_at, c.updated_at))) AS tempo_inicio_medio,

        SEC_TO_TIME(AVG(
          CASE 
            WHEN c.closed_at IS NOT NULL 
            THEN TIMESTAMPDIFF(SECOND, c.updated_at, c.closed_at)
          END
        )) AS tempo_final_medio,

        SEC_TO_TIME(AVG(
          CASE 
            WHEN c.closed_at IS NOT NULL 
            THEN TIMESTAMPDIFF(SECOND, c.created_at, c.closed_at)
          END
        )) AS tempo_total_medio

      FROM chamados c
      WHERE DATE_FORMAT(c.created_at, '%Y-%m') = ?
      `,
      [month]
    );

    const [[qtde_abertos]]: any = await db.query(
      `
      SELECT 
        COUNT(*) as qtde_abertos
      FROM chamados c
      WHERE DATE_FORMAT(c.created_at, '%Y-%m') = ?
      `,
      [month]
    );

    const [[qtde_fechados]]: any = await db.query(
      `
      SELECT 
        COUNT(*) as qtde_fechados
      FROM chamados c
      WHERE DATE_FORMAT(c.closed_at, '%Y-%m') = ?
      `,
      [month]
    );

    return NextResponse.json({
      porResponsavel,
      porProduto,
      tempos,
      qtde_abertos: qtde_abertos.qtde_abertos,
      qtde_fechados: qtde_fechados.qtde_fechados
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro' }, { status: 500 });
  }
}