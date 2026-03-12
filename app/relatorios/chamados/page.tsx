'use client'

import { Layout } from '@/components/Layout';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { MdArrowBack } from 'react-icons/md';
import{ useRouter } from 'next/navigation';


interface Chamado {
  id: number,
  empresa: string,
  solicitante: string,
  produto: string,
  responsavel: string,
  status: string,
  created_at: string,
  closed_at: string | null,
  tempo_minutos: number,
}

export default function RelatorioChamadosPorEmpresas() {
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [produto, setProduto] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [status, setStatus] = useState('');
  const [exportForm, setExportForm] = useState(false);

  const [dados, setDados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function gerarRelatorio() {
    setExportForm(true);
    if (!inicio || !fim) {
      alert('Selecione as datas');
      return;
    }

    setLoading(true);

    const res = await fetch(
      `/api/relatorios/empresas?inicio=${inicio}&fim=${fim}&empresa=${empresa}&responsavel=${responsavel}&produto=${produto}`
    );

    const json = await res.json();
    setDados(json);

    setLoading(false);
  };

  function exportarExcel() {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatorio');

    XLSX.writeFile(workbook, 'relatorio_empresas.xlsx');
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
            Relatório de Chamados
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
      
      <div className='p-30 flex items-center justify-between'>
        <div className='text-gray-400 mb-8'>
          <label>Data Início: </label>
          <input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className="text-gray-500 rounded border focus:outline mb-2"
          />
          <label style={{ marginLeft: 15 }}>Data Fim: </label>
          <input
            type="date"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            className="text-gray-500 rounded border focus:outline"
          />
          <label style={{ marginLeft: 15 }}>Empresa: </label>
          <input
            type="text"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            className="text-gray-500 rounded border focus:outline"
          />
          <label style={{ marginLeft: 15 }}>Produto: </label>
          <input
            type="text"
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
            className="text-gray-500 rounded border focus:outline"
          />
        </div>
      </div>
      <div className='p-30 flex items-center justify-between'>
        <div className='text-gray-400 mb-8'>
            <label style={{ marginLeft: 15 }}>Responsável: </label>
          <input
            type="text"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            className="text-gray-500 rounded border focus:outline"
          />
          <label style={{ marginLeft: 15 }}>Status: </label>
          <label style={{ marginLeft: 10 }}>
            <input
              type="radio"
              name="status"
              value="Aberto"
              checked={status === 'open'}
              onChange={(e) => setStatus(e.target.value)}
              className="text-gray-500 rounded border focus:outline"
            />
            Aberto
          </label>
          <label style={{ marginLeft: 10 }}>
            <input
              type="radio"
              name="status"
              value="Em andamento"
              checked={status === 'in_progress'}
              onChange={(e) => setStatus(e.target.value)}
              className="text-gray-500 rounded border focus:outline"
            />
            Em andamento
          </label>
          <label style={{ marginLeft: 10 }}>
            <input
              type="radio"
              name="status"
              value="Fechado"
              checked={status === 'closed'}
              onChange={(e) => setStatus(e.target.value)}
              className="text-gray-500 rounded border focus:outline"
            />
            Fechado
          </label>
        </div>
      </div>
      
      <div>
        <table className='w-full border-collapse min-w-[1400px] text-gray-400'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Empresa</th>
              <th>Solicitante</th>
              <th>Produto</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Abertura</th>
              <th>Fechamento</th>
              <th>Tempo (min)</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.empresa}</td>
                <td>{item.solicitante}</td>
                <td>{item.produto}</td>
                <td>{item.responsavel ?? 'Sem responsável'}</td>
                <td>
                  {item.status === 'in_progress'
                    ? 'Em andamento'
                      : item.status === 'open'
                        ? 'Aberto'
                        : 'Fechado'}
                </td>
                <td>{new Date(item.created_at).toLocaleString()}</td>
                <td>
                  {item.closed_at
                    ? new Date(item.closed_at).toLocaleString()
                    : 'Em andamento'}
                </td>
                <td>{item.tempo_minutos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
};

