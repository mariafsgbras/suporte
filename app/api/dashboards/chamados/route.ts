import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const [rows]: any = await db.query(`
    SELECT 
      COUNT(*) AS total,
      COUNT(CASE WHEN status = 'open' THEN 1 END) AS open,
      COUNT(CASE WHEN status = 'closed' THEN 1 END) AS closed,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) AS in_progress
    FROM chamados c
  `);

  const data = rows[0];

  const dashboard = {
    totalTickets: data.total,
    openTickets: data.open,
    closedTickets: data.closed,
    inProgressTickets: data.in_progress,
  };
  
  return NextResponse.json(dashboard);
}
