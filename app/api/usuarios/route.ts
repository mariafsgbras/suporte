import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
    FROM usuarios u
    JOIN empresas e ON e.id = u.empresa_id`;

  const whereClauses: string[] = [];
  const params: any[] = [];

  if (search && search.trim() !=='') {
    whereClauses.push(`
      (
        u.id LIKE ? OR
        u.nome LIKE ? OR
        u.ativo LIKE ? OR
        e.nome LIKE ?
      )
    `);

    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
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
      u.id,
      u.nome,
      u.ativo,
      e.nome AS empresa
    ${baseQuery}
    ${whereSQL}
    ORDER BY u.id ASC
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
