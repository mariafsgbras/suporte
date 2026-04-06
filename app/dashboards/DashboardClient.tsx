'use client';

import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import {
  LabelList,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

type TicketsData = {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  inProgressTickets: number;
}

type ResponsibleData = {
  responsavel: string;
  total: number;
}[];

type ProductData = {
  produto: string;
  total: number;
}[];

type ClientData = {
  empresa: string;
  total: number;
}[];

type MonthData = {
  mes: string;
  total: number;
}[];

export default function DashboardsPage() {
  const [ticketDashboard, setTicketDashboard] = useState<TicketsData | null>(null);
  const [responsibleDashboard, setResponsibleDashboard] = useState<ResponsibleData>([]);
  const [productDashboard, setProductDashboard] = useState<ProductData>([]);
  const [clientDashboard, setClientDashboard] = useState<ClientData>([]);
  const [monthDashboard, setMonthDashboard] = useState<MonthData>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const topClients = clientDashboard.map(client => ({
    ...client,
    empresa: client.empresa
      ? client.empresa.split(' ').slice(0, 2).join(' ')
      : 'Sem nome'
  }));

  const COLORS = [
    '#16a34a',
    '#2563eb',
    '#dc2626',
    '#ca8a04',
    '#7c3aed',
    '#0d9488',
  ];

  useEffect(() => {
    async function loadDashboard(){
      try{
        const [ticketRes, respRes, prodRes, cliRes, monRes] = await Promise.all([
          fetch(`/api/dashboards/chamados`),
          fetch(`/api/dashboards/atendentes`),
          fetch(`/api/dashboards/produtos`),
          fetch(`/api/dashboards/empresas`),
          fetch(`/api/dashboards/mes`),
        ]);

        setTicketDashboard(await ticketRes.json());
        setResponsibleDashboard(await respRes.json());
        setProductDashboard(await prodRes.json());
        setClientDashboard(await cliRes.json());
        setMonthDashboard(await monRes.json());
      }catch{
        setError('Não foi possível carregar o dashboard');
      }finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Carregando dashboard...</p>
      </Layout>
    );
  }

  if (error || !ticketDashboard) {
    return (
      <Layout>
        <p className="text-red-500">{error ?? 'Não foi possível carregar o dashboard.'}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-xl font-semibold text-gray-800 mb-2">
        Dashboard
      </h1>

      <h1 className="text-xl font-semibold text-gray-600 mb-2 mt-6">
        Quantidade de Chamados
      </h1>

      <div className="flex gap-6 mb-4">
        <StatCard label="Total" value={ticketDashboard.totalTickets} />
        <StatCard label="Abertos" value={ticketDashboard.openTickets} color="text-red-600" />
        <StatCard label="Em andamento" value={ticketDashboard.inProgressTickets} color="text-yellow-600" />
        <StatCard label="Fechados" value={ticketDashboard.closedTickets} color="text-green-600" />
      </div>

      <div className="flex w-full gap-6">
        <div className="flex flex-col w-full">
          <h1 className="text-xl font-semibold text-gray-600 mb-2 mt-6">
            Quantidade Total de Chamados Por Atendente
          </h1>
          <div className="h-80 w-full border rounded p-4 text-gray-300 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responsibleDashboard}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="responsavel"
                  angle={-30}
                  textAnchor="end"
                  height={75}
                />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} chamados`, 'Quantidade']} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="total" position="top" />
                  {responsibleDashboard.map((_,index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col w-full">
          <h1 className="text-xl font-semibold text-gray-600 mb-2 mt-6">
            Quantidade Total de Chamados Por Produto
          </h1>
          <div className="h-80 w-full border rounded p-4 text-gray-300 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productDashboard}>
                <CartesianGrid strokeDasharray="5 5" />
                <XAxis
                  dataKey="produto"
                  angle={-30}
                  textAnchor="end"
                  height={80}
                />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} chamados`, 'Quantidade']} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="total" position="top" />
                  {productDashboard.map((_,index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex w-full gap-6">
        <div className="flex flex-col w-full">
          <h1 className="text-xl font-semibold text-gray-600 mb-2 mt-6">
            Quantidade Total de Chamados Por Clientes (Top 10)
          </h1>
          <div className="h-80 w-full border rounded p-4 text-gray-300 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topClients}
                layout="vertical"
              >
                <XAxis type="number" />
                <YAxis dataKey="empresa" type="category" width={150} />
                 <Tooltip />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {clientDashboard.map((_,index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col w-full">
          <h1 className="text-xl font-semibold text-gray-600 mb-2 mt-6">
            Quantidade de Chamados por Mês
          </h1>
          <div className="h-80 w-full border rounded p-2 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthDashboard}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes"
                  interval={0}
                  angle={-30}
                  textAnchor='end'
                  height={60}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
    </Layout>
  );
}

function StatCard({
  label,
  value,
  color = "text-gray-800",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="border rounded px-4 py-3 min-w-[120px] h-24 w-full flex flex-col justify-center items-center text-gray-300">
      <div className={`text-2xl font-semibold ${color}`}>{value}</div>  
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}