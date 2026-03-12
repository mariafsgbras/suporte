import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const inicio = searchParams.get('inicio')
    const fim = searchParams.get('fim')

    if (!inicio || !fim) {
      return NextResponse.json(
        { error: 'Parâmetros de data são obrigatórios' },
        { status: 400 }
      )
    }

    const [rows]: any = await db.query(
      `
      SELECT 
        c.id,
        e.nome AS empresa,
        u.nome AS responsavel,
        c.status,
        c.created_at,
        c.closed_at,
        TIMESTAMPDIFF(MINUTE, c.created_at, c.closed_at) AS tempo_minutos
      FROM chamados c
      LEFT JOIN usuarios u ON u.id = c.responsavel_id
      LEFT JOIN empresas e ON e.id = c.empresa_id
      WHERE DATE(c.created_at) BETWEEN ? AND ?
      ORDER BY c.created_at DESC
      `,
      [inicio, fim]
    )

    const formatted = rows.map((row: any) => ({
      ...row,
      tempo_minutos: row.tempo_minutos ?? 0
    }))

    return NextResponse.json(formatted)

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    )
  }
}