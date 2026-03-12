import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url);
    const cnpj = searchParams.get('cnpj');
    const id = searchParams.get('id');

    if (!cnpj && !id) {
      return NextResponse.json(
        { message: 'CNPJ ou ID não informado' },
        { status: 400 }
      );
    }

    let query = '';
    let params: any[] = [];

    if (id) {
      query = `
        SELECT id, nome, cnpj, created_at 
        FROM empresas 
        WHERE id = ?
      `;
      params = [id];
    } else {
      query = `
        SELECT id, nome, cnpj, created_at 
        FROM empresas 
        WHERE cnpj = ?
      `;
      params = [cnpj];
    }

    const [rows]: any = await db.query(query, params);

    if (rows.length > 0) {
      return NextResponse.json({
        existe: true,
        empresa: rows[0],
      });
    }

    return NextResponse.json({ existe: false });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Erro ao buscar empresa' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request){
    try{
        const { nome, cnpj } = await req.json();

        const [result]: any = await db.query(
             `
            INSERT INTO empresas
            (nome, cnpj, created_at)
            VALUES (?, ?, NOW())
            `,
            [nome, cnpj]
        )

        return NextResponse.json({
          empresa_id: result.insertId,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'Erro ao criar empresa' },
            { status: 500 }
        );
    }
}