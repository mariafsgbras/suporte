import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const [rows]: any = await db.query(`
    SELECT 
        t.tipo AS tipo,
        COUNT(*) AS total
    FROM chamados c
    LEFT JOIN classificacao t ON t.id = c.classificacao_id
    WHERE tipo <> 'NULL'
    GROUP BY tipo
    ORDER BY tipo ASC
  `);

  const formatted = rows.map((row: any) => ({
    tipo: row.tipo,
    total: Number(row.total),
  }));

  
  return NextResponse.json(formatted);
}