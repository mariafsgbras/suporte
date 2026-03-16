'use client';

import { Ticket, TicketStatus } from "@/app/chamados/ChamadosClient";

type Props = {
  tickets: Ticket[];
  onRowClick: (id: number) => void;
};

const statusMap: Record<
  TicketStatus,
  { label: string; color: string }
> = {
  open: { label: "Aberto", color: "text-red-600" },
  in_progress: { label: "Em andamento", color: "text-yellow-600" },
  closed: { label: "Fechado", color: "text-green-600" },
};

function formatDateTime(dateString?: string | null) {
  if (!dateString) return '-';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return '-';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}


export function TicketsTable({ tickets, onRowClick }: Props) {
  return (
    <div className="overflow-x-auto border rounded">
      <table className="w-full border-collapse min-w-[1400px]">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-left h-12">
            <th className="px-4">Nº</th>
            <th className="px-4">Status</th>
            <th className="px-4">Produto</th>
            <th className="px-4">Solicitante</th>
            <th className="px-4">Empresa</th>
            <th className="px-4">CNPJ</th>
            <th className="px-4">Responsável</th>
            <th className="px-4">Solicitação</th>
            <th className="px-4">Data Abertura</th>
            <th className="px-4">Início Atendimento</th>
            <th className="px-4">Data Fechamento</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map(ticket => (
            <tr
              key={ticket.id}
              onClick={() => onRowClick(ticket.id)}
              className="h-12 cursor-pointer hover:bg-gray-100 text-gray-400 bg-gray-50 "
            >
              <td className="px-4 whitespace-nowrap">{ticket.id}</td>
              <td className={`px-4 whitespace-nowrap font-medium ${statusMap[ticket.status].color}`}>
                {statusMap[ticket.status].label}
              </td>
              <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{ticket.product}</td>
              <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{ticket.requester}</td>
              <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{ticket.company}</td>
              <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{ticket.cnpj}</td>
              <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{ticket.responsible}</td>
              <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{ticket.description}</td>
              <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{formatDateTime(ticket.open_date)}</td>
              <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{formatDateTime(ticket.updated_at ?? null)}</td>
              <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{formatDateTime(ticket.closed_date ?? null)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
