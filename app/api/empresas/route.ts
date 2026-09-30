import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session){
    return NextResponse.json(
      { error: "Não autenticado"},
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 20);
  const search = searchParams.get('search');

  const offset = (page - 1) * limit;

  let baseQuery = `
    FROM empresas e`;

  const whereClauses: string[] = [];
  const params: any[] = [];

  if (search && search.trim() !=='') {
    whereClauses.push(`
      (
        e.id LIKE ? OR
        e.nome LIKE ? OR
        e.cnpj LIKE ?
      )
    `);

    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const whereSQL = whereClauses.length
    ? ' WHERE ' + whereClauses.join(' AND ')
    : '';

  const [countRows]: any = await db.query(
    `SELECT COUNT(*) as total ${baseQuery} ${whereSQL}`,
    params
  );

  const total = countRows[0].total;

  const [rows] = await db.query(`
    SELECT 
      e.id,
      e.nome,
      (
        e.prioridade = '1'
        AND (e.data_inicio_prioridade IS NULL OR e.data_inicio_prioridade <= CURDATE())
        AND (e.data_fim_prioridade IS NULL OR e.data_fim_prioridade >= CURDATE())
      ) AS prioridade_ativa
    ${baseQuery}
    ${whereSQL}
    ORDER BY e.id ASC
    LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );
  
  return NextResponse.json({
    data: rows,
    total,
    page,
    limit,
  });
}
