'use client';

import { TicketStatus } from '@/app/chamados/ChamadosClient';

type Props = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | TicketStatus;
  onStatusChange: (value: "all" | TicketStatus) => void;
};

export function TicketsFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  }: Props) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[250px]">
        <input
          type="text"
          placeholder="Pesquisar por número do chamado, produto, empresa..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 text-gray-500 rounded border focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>
      
      <div className="flex gap-2">
        <FilterButton
          label="Todos"
          active={statusFilter === "all"}
          onClick={() => onStatusChange("all")}
        />
        <FilterButton
          label="Abertos"
          active={statusFilter === "open"}
          onClick={() => onStatusChange("open")}
        />
        <FilterButton
          label="Em andamento"
          active={statusFilter === "in_progress"}
          onClick={() => onStatusChange("in_progress")}
        />
        <FilterButton
          label="Fechados"
          active={statusFilter === "closed"}
          onClick={() => onStatusChange("closed")}
        />
      </div>
    </div>
  );
}
function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded text-sm border ${
        active
          ? "bg-green-600 text-white border-green-600"
          : "bg-white text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}