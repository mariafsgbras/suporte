import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const [rows]: any = await db.query(`
    SELECT 
        p.nome AS produto,
        COUNT(*) AS total
    FROM chamados c
    LEFT JOIN produtos p ON p.id = c.produto_id 
    GROUP BY produto_id
    ORDER BY produto ASC
  `);

  const formatted = rows.map((row: any) => ({
    produto: row.produto,
    total: Number(row.total),
  }));

  
  return NextResponse.json(formatted);
}