import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const [rows]: any = await db.query(`
    SELECT
        e.nome AS empresa,
        COUNT(*) AS total
    FROM chamados c 
    LEFT JOIN empresas e ON e.id = c.empresa_id
    WHERE e.nome IS NOT NULL and e.nome <> ''
    GROUP BY c.empresa_id 
    ORDER BY total DESC
    LIMIT 10
  `);

  const formatted = rows.map((row: any) => ({
    empresa: row.empresa,
    total: Number(row.total),
  }));

  console.log(formatted);
  return NextResponse.json(formatted);
}