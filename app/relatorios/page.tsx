'use client';

import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FormsPage() {
  const router = useRouter();

  const relatorios = [
    {
      titulo: 'Relatório de Chamados',
      descricao: 'Lista detalhada de chamados por período',
      rota: '/relatorios/chamados'
    },
    {
      titulo: 'Relatório Geral Mensal',
      descricao: 'Relatório geral de chamados por mês',
      rota: '/relatorios/mensal'
    },
    {
      titulo: 'Relatório de Tempo de Atendimento',
      descricao: 'Relatório de análise de tempo de atendimento',
      rota: '/relatorios/tempo'
    },
  ]

  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Carregando relatórios...</p>
      </Layout>
    );
  }

  useEffect(() => {
  }, [searchTerm]);

  return (
    <Layout>
      <h1 className="text-xl font-semibold text-gray-800 mb-2">
        Relatórios
      </h1>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Buscar relatório..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 text-gray-500 rounded border focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: 20,
        marginTop: 30
      }}>
        {relatorios.map((item, index) => (
          <div
            key={index}
            onClick={() => router.push(item.rota)}
            style={{
              padding: 20,
              borderRadius: 8,
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
              border: '1px solid #ddd',
              transition: '0.2s'
            }}
          >
            <h3 className="text-gray-800">{item.titulo}</h3>
            <p className="text-gray-500">
              {item.descricao}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
}