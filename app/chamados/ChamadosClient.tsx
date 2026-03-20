'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layout } from "@/components/Layout";
import { TicketsFilters } from "@/components/TicketsFilters";
import { TicketsTable } from "@/components/TicketsTable";
import { useSession } from "next-auth/react";

export type TicketStatus = "open" | "closed" | "in_progress";

export type Ticket = {
  id: number;
  product: string;
  requester: string;
  company: string;
  cnpj: string;
  responsible?: string;
  description: string;
  status: TicketStatus;
  open_date: string;
  closed_date?: string;
  updated_at?: string;
};

export default function ChamadosPage() {
  const { data: session } = useSession();
  const isCliente = session?.user.role === "cliente";
  const hasActions = !isCliente;

  const searchParams = useSearchParams();

  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));
  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>(
    (searchParams.get('status') as 'all' | TicketStatus) ?? 'open'
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '');
  const onlyMineParam = searchParams.get("onlyMine") ?? searchParams.get("onlymine");
  const [onlyMine, setOnlyMine] = useState(onlyMineParam === "true");

  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  
  async function loadTickets() {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status: statusFilter,
      search: searchTerm,
      onlyMine: onlyMine.toString(),
    });

    const res = await fetch(`/api/chamados?${params}`);
    const result = await res.json();

    const mappedTickets: Ticket[] = result.data.map((item: any) => ({
      id: item.id,
      product: item.produto,
      requester: item.solicitante,
      company: item.empresa,
      cnpj: item.cnpj,
      responsible: item.responsavel ?? '-',
      description: item.descricao ?? '',
      status: item.status,
      open_date: item.created_at,
      closed_date: item.closed_at ?? null,
      updated_at: item.updated_at ?? null,
    }));

    setTickets(mappedTickets);
    setTotal(result.total);
    setLoading(false);
  }

  useEffect(() => {
    loadTickets();
    const interval = setInterval(() => {
      loadTickets();
    }, 60000);

    return () => clearInterval(interval);
  }, [page, statusFilter, onlyMine, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm, onlyMine]);

  const totalPages = Math.ceil(total / limit);

  const filteredBySearch = tickets.filter(ticket => {
    const search = searchTerm.toLowerCase();
    return (
      ticket.id.toString().includes(search) ||
      ticket.product.toLowerCase().includes(search) ||
      ticket.company.toLowerCase().includes(search) ||
      ticket.cnpj.toLowerCase().includes(search) ||
      ticket.requester.toLowerCase().includes(search) ||
      ticket.description.toLowerCase().includes(search) ||
      ticket.responsible?.toLowerCase().includes(search) ||
      ticket.open_date.toLowerCase().includes(search) ||
      ticket.closed_date?.toLowerCase().includes(search)
    );
  });

  const visibleTickets = filteredBySearch.filter(ticket => {
    if (statusFilter === "all") return true;
    return ticket.status === statusFilter;
  });

  const ticketsCount = total;

  const statusLabelMap: Record<"all" | TicketStatus, string> = {
    all: "chamado",
    open: "chamado aberto",
    in_progress: "chamado em andamento",
    closed: "chamado fechado",
  };

  const statusLabelMapPlural: Record<"all" | TicketStatus, string> = {
    all: "chamados",
    open: "chamados abertos",
    in_progress: "chamados em andamento",
    closed: "chamados fechados",
  };

  function countLabel() {
    if (ticketsCount === 1) {
      return statusLabelMap[statusFilter];
    }else{
      return statusLabelMapPlural[statusFilter];      
    }
  }

  useEffect(() => {
    if (statusFilter === 'open') {
      setOnlyMine(false);
    }
  }, [statusFilter]);
  
  return (
    <Layout>
      <h1 className="text-xl text-gray-800 font-semibold mb-3">
        Chamados
      </h1>

      <div className="bg-gray-100 p-4 rounded space-y-3">
        <TicketsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {ticketsCount} {countLabel()}
          </p>

          {hasActions && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlyMine}
                disabled={statusFilter === 'open'}
                onChange={(e) => setOnlyMine(e.target.checked)}
              />
              <label className="text-sm text-gray-700">
                Mostrar apenas meus chamados
              </label>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-2">
        {loading ? (
          <p className="text-gray-500">Carregando chamados...</p>
        ) : (
          <TicketsTable
            tickets={visibleTickets}
            onRowClick={(id) => {
              const from = encodeURIComponent(
                `/chamados?page=${page}&status=${statusFilter}&search=${searchTerm}&onlymine=${onlyMine}`
              );
              router.push(`/chamados/${id}?from=${from}`);
            }}
          />
        )}
      </div>
      <div className="flex items-center justify-between mt-4">
      <button
        disabled={page === 1}
        onClick={() => setPage(prev => prev - 1)}
        className="px-3 py-1 bg-[#3f7a49] rounded disabled:opacity-50"
      >
        Anterior
      </button>

      <span className="text-sm text-gray-500">
        Página {page} de {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => setPage(prev => prev + 1)}
        className="px-3 py-1 bg-[#3f7a49] rounded disabled:opacity-50"
      >
        Próxima
      </button>
    </div>
    </Layout>
  );
}