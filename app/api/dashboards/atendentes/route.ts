import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const [rows]: any = await db.query(`
    SELECT 
      COALESCE(r.nome, 'Sem responsável') AS responsavel,
      COUNT(*) AS total
    FROM chamados c
    LEFT JOIN usuarios r ON r.id = c.responsavel_id
    WHERE r.ativo = 1 AND r.id <> 9
    GROUP BY r.nome
    ORDER BY responsavel
  `);

  const formatted = rows.map((row: any) => ({
    responsavel: row.responsavel,
    total: Number(row.total),
  }));

  
  return NextResponse.json(formatted);
}