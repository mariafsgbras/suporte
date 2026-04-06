'use client'

import { Layout } from '@/components/Layout';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { MdArrowBack } from 'react-icons/md';
import{ useRouter } from 'next/navigation';
import { useEffect } from 'react';


interface Chamado {
  id: number,
  empresa: string,
  solicitante: string,
  produto: string,
  responsavel: string,
  status: string,
  created_at: string,
  updated_at: string | null,
  closed_at: string | null,
  tempo_inicio: number,
  tempo_final: number,
  tempo_total: number
}

export default function RelatorioTempoAtendimento() {
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [produto, setProduto] = useState('');
  const [responsavel, setResponsavel] = useState('');
  
  const [exportForm, setExportForm] = useState(false);

  const [dados, setDados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(false);

  const [produtos, setProdutos] = useState<string[]>([]);
  const [responsaveis, setResponsaveis] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  const router = useRouter();

  async function gerarRelatorio() {
    setExportForm(true);
    if (!inicio || !fim) {
      alert('Selecione as datas');
      return;
    }

    setLoading(true);

    const res = await fetch(
      `/api/relatorios/tempo?inicio=${inicio}&fim=${fim}&empresa=${empresa}&responsavel=${responsavel}&produto=${produto}&status=${status}`
    );

    const json = await res.json();
    setDados(json);

    setLoading(false);
  };

  function exportarExcel() {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatorio');

    XLSX.writeFile(workbook, 'relatorio_chamados.xlsx');
  };

  useEffect(() => {
    async function  carregarFiltros() {
      const res = await fetch('/api/filtros/chamados');
      const json = await res.json();

      setProdutos(json.produtos);
      setResponsaveis(json.responsaveis);
    }

    carregarFiltros();
  }, []);
  
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
            Relatório de Tempo de Atendimento
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
          <button
            className='px-3 py-2 rounded text-sm border bg-gray text-gray-600 hover:bg-gray-100'
            onClick={exportarExcel}
            disabled={!exportForm}
          >
            Exportar para Excel
          </button>
        </div>
      </div>
      
      <div className='p-4 grid grid-cols-2 gap-4 text-gray-600 mb-4 bg-white rounded border'>
        <div>
          <label>Data Início: </label>
          <input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className="w-full rounded border focus:outline px-2 py-1"
          />
        </div>
        <div>
          <label>Data Fim: </label>
          <input
            type="date"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            className="w-full rounded border focus:outline px-2 py-1"
          />
        </div>
        <div>
          <label>Empresa: </label>
          <input
            type="text"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            className="w-full rounded border focus:outline px-2 py-1"
          />
        </div>
        <div>
          <label>Produto: </label>
          <select
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
            className="w-full rounded border focus:outline px-2 py-1"
          >
            <option value="">Todos</option>
            {produtos.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Responsável: </label>
          <select
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            className="w-full rounded border focus:outline px-2 py-1"
          >
            <option value="">Todos</option>
            {responsaveis.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Status: </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className='w-full rounded border focus:outline px-2 py-1'
          >
            <option value="">Todos</option>
            <option value="open">Abertos</option>
            <option value="in_progress">Em andamento</option>
            <option value="closed">Fechados</option>
          </select>
        </div>
      </div>
      
      <div className='overflow-x-auto border rounded'>
        <p className="p-2 text-gray-600">
          Total de chamados filtrados: {dados.length}
        </p>
        <table className='w-full border-collapse min-w-[1200px] text-gray-400'>
          <thead>
            <tr className='bg-gray-100 text-gray-600'>
              <th className='border border-gray-300 px-4 py-2'>ID</th>
              <th className='border border-gray-300 px-4 py-2'>Empresa</th>
              <th className='border border-gray-300 px-4 py-2'>Produto</th>
              <th className='border border-gray-300 px-4 py-2'>Responsável</th>
              <th className='border border-gray-300 px-4 py-2'>Status</th>
              <th className='border border-gray-300 px-4 py-2'>Abertura</th>
              <th className='border border-gray-300 px-4 py-2'>Início Atendimento</th>
              <th className='border border-gray-300 px-4 py-2'>Fechamento</th>
              <th className='border border-gray-300 px-4 py-2'>Tempo Início Atendimento</th>
              <th className='border border-gray-300 px-4 py-2'>Tempo Finalização do Atendimento</th>
              <th className='border border-gray-300 px-4 py-2'>Tempo Total do Atendimento</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((item, index) => (
              <tr 
                key={item.id}
                className='h-12 cursor-pointer text-gray-400 bg-gray-50'
              >
                <td className='px-4 whitespace-nowrap border border-gray-300'>{item.id}</td>
                <td className='border border-gray-300 px-4 py-2'>{item.empresa}</td>
                <td className='border border-gray-300 px-4 py-2'>{item.produto}</td>
                <td className='border border-gray-300 px-4 py-2'>{item.responsavel ?? 'Sem responsável'}</td>
                <td className='border border-gray-300 px-4 py-2'>
                  {item.status === 'in_progress'
                    ? 'Em andamento'
                      : item.status === 'open'
                        ? 'Aberto'
                        : 'Fechado'}
                </td>
                <td className='border border-gray-300 px-4 py-2'>{new Date(item.created_at).toLocaleString()}</td>
                <td className='border border-gray-300 px-4 py-2'>
                    {item.updated_at
                        ? new Date(item.updated_at).toLocaleString()
                        : 'Aberto'}
                    </td>
                <td className='border border-gray-300 px-4 py-2'>
                  {item.closed_at
                    ? new Date(item.closed_at).toLocaleString()
                    : 'Em andamento'}
                </td>
                <td className='border border-gray-300 px-4 py-2'>{item.tempo_inicio}</td>
                <td className='border border-gray-300 px-4 py-2'>{item.tempo_final}</td>
                <td className='border border-gray-300 px-4 py-2'>{item.tempo_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
};

