import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const months: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar',
  '04': 'Abr', '05': 'Mai', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Set',
  '10': 'Out', '11': 'Nov', '12': 'Dez',
};

export async function GET() {
  const [rows]: any = await db.query(`
    SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS mes,
        COUNT(*) AS total
    FROM chamados
    WHERE created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 12 MONTH)
    GROUP BY mes
    ORDER BY mes
  `);

  const formatted = rows.map((row: any) => {
    const [year, month] = row.mes.split('-');

    return {
        mes: `${months[month]}/${year}`,
        total: Number(row.total),
    }
    
  });

  return NextResponse.json(formatted);
}