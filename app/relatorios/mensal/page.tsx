'use client'

import { Layout } from '@/components/Layout';
import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MdArrowBack } from 'react-icons/md';
import{ useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
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

export default function RelatorioTempoAtendimento() {
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportForm, setExportForm] = useState(false);

  const [dados, setDados] = useState<any>({
    porResponsavel: [],
    porProduto: [],
    tempos: {},
    qtde_abertos: 0,
    qtde_fechados: 0,
  });

  const router = useRouter();

  const COLORS = [
    '#16a34a',
    '#2563eb',
    '#dc2626',
    '#ca8a04',
    '#7c3aed',
    '#0d9488',
  ];

  async function gerarRelatorio() {
    setExportForm(true);
    if (!month) {
      alert('Informe o mês e ano que deseja filtrar');
      return;
    }

    setLoading(true);

    const res = await fetch(
      `/api/relatorios/mensal?month=${month}`
    );

    const json = await res.json();
    setDados(json);

    setLoading(false);
  };
  
  return (
    <Layout>
      <div className='flex items-center gap-3 justify-between mb-4'>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/relatorios')}
            className="flex items-center gap-1 text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
          >
            <MdArrowBack size={18} className="text-gray-600 hover:bg-[#3f7a49] hover:text-white rounded" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Relatório Geral Mensal 
          </h1>
        </div>
        <div className='flex items-center gap-3'>
          <button
            onClick={gerarRelatorio}
            style={{
              marginLeft: 15,
              backgroundColor: '#305BAB',
              color: '#fff',
              padding: '6px 15px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
          {/*<button
            className='px-3 py-2 rounded text-sm border bg-gray text-gray-600 hover:bg-gray-100'
            onClick={salvarRelatorio}
            disabled={!exportForm}
          >
            Salvar Relatório
          </button>*/}
        </div>
      </div>
      <div className='p-4 grid grid-cols-2 gap-4 text-gray-600 mb-4 bg-white rounded border'>
        <div>
          <label>Mês:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded border focus:outline px-2 py-1"
          />
        </div>
      </div>

      <div className='flex w-full gap-6'>
        <h1 className='text-l font-semibold text-gray-600 mb-2 mt-6'>Quantidade total de chamados abertos no período</h1>
        <StatCard label="Abertos" value={dados.qtde_abertos} color='text-green-600'/>
        <StatCard label="Fechados" value={dados.qtde_fechados} color='text-red-600'/>
      </div>
      
      <div className='flex w-full gap-6 mb-4'>
        <div className='flex flex-col w-full'>
          <h1 className='text-l font-semibold text-gray-600 mb-2 mt-6'>
            Quantidade Total de Chamados Por Atendente
          </h1>
          <div className='h-80 w-full border rounded p-4 text-gray-300 text-xs'>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dados.porResponsavel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="responsavel"
                  angle={-30}
                  textAnchor="end"
                  height={75}
                />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} chamados`, 'Quantidade']} />
                <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="quantidade" position="top" />
                  {dados.porResponsavel.map((_: any,index: number) => (
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
        <div className='flex flex-col w-full'>
          <h1 className='text-l font-semibold text-gray-600 mb-2 mt-6'>
            Quantidade Total de Chamados Por Produto
          </h1>
          <div className='h-80 w-full border rounded p-4 text-gray-300 text-xs'>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dados.porProduto}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="produto"
                  angle={-30}
                  textAnchor="end"
                  height={80}
                />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} chamados`, 'Quantidade']} />
                <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="quantidade" position="top" />
                  {dados.porProduto.map((_: any,index: number) => (
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

      <div className='flex w-full gap-6'>
        <h1 className='text-l font-semibold text-gray-600 mb-2 mt-6'>Tempo Médio de Atendimento (em horas)</h1>
        <StatCard label="Início Atendimento" value={formatarTempo(dados.tempos.tempo_inicio_medio)} color='text-yellow-600'/>
        <StatCard label="Finalização do Atendimento" value={formatarTempo(dados.tempos.tempo_final_medio)} color='text-orange-600'/>
        <StatCard label="Total do Chamado" value={formatarTempo(dados.tempos.tempo_total_medio)} color='text-red-600'/>
      </div>  
    </Layout>
  )
};

function StatCard({
  label,
  value,
  color = "text-gray-800",
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="border rounded px-4 py-3 min-w-[120px] h-24 w-full flex flex-col justify-center items-center text-gray-300">
      <div className={`text-2xl font-semibold ${color}`}>{value}</div>  
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}

function formatarTempo(tempo: string) {
  if (!tempo) return '0h';

  const [h, m] = tempo.split(':');
  return `${h}h${m}m`;
}