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
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const onlyMine = searchParams.get('onlyMine');

  const offset = (page - 1) * limit;

  let baseQuery = `
    FROM chamados c
    JOIN solicitantes s ON s.id = c.solicitante_id
    JOIN produtos p ON p.id = c.produto_id
    JOIN empresas e ON e.id = c.empresa_id
    LEFT JOIN usuarios r ON r.id = c.responsavel_id`;

  const whereClauses: string[] = [];
  const params: any[] = [];

  if (session.user.role === "cliente") {
    whereClauses.push("c.empresa_id = ?");
    params.push(session.user.empresa_id);
  }

  if (onlyMine === "true") {
    whereClauses.push('c.responsavel_id = ?');
    params.push(Number(session.user.id));
  }

  if (status && status !== 'all') {
    whereClauses.push('c.status = ?');
    params.push(status);
  }

  if (search) {
    whereClauses.push(`
      (
        c.id LIKE ? OR
        s.nome LIKE ? OR
        p.nome LIKE ? OR
        e.nome LIKE ? OR
        e.cnpj LIKE ? OR
        c.descricao LIKE ?
      )
    `);

    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
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
      c.id,
      c.status,
      c.created_at,
      c.closed_at,
      c.updated_at,
      c.descricao,
      s.nome AS solicitante,
      p.nome AS produto,
      e.nome AS empresa,
      e.cnpj AS cnpj,
      r.nome AS responsavel
    ${baseQuery}
    ${whereSQL}
    ORDER BY c.created_at DESC
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
