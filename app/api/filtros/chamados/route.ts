import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [produtos]: any = await db.query(`
      SELECT DISTINCT nome FROM produtos ORDER BY nome
    `);

    const [responsaveis]: any = await db.query(`
      SELECT DISTINCT 
        nome 
      FROM 
        usuarios 
      WHERE id in (1,2,3,5,6)
      ORDER BY nome
    `);

    return NextResponse.json({
      produtos: produtos.map((p: any) => p.nome),
      responsaveis: responsaveis.map((r: any) => r.nome),
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar filtros' }, { status: 500 });
  }
}