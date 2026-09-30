'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { MdArrowBack } from 'react-icons/md';
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast';
import { MdWarningAmber } from 'react-icons/md';
import { IMaskInput } from 'react-imask';

type Hotline = '1' | '0';

type Empresa = {
  id: number;
  name: string;
  cnpj: string;
  prioridade: string;
  created_at: string;
  data_inicio_prioridade: string | null;
  data_fim_prioridade: string | null;
  prioridade_ativa: boolean;
};

export default function EmpresaPage() {
  const { data: session } = useSession();
  const podeEditar = ['admin', 'atendente'].includes(session?.user?.role ?? '');

  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [prioridade, setPrioridade] = useState<Hotline>('0');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const temPrioridade = Boolean(empresa?.prioridade_ativa);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchEmpresa() {
    try {
      const res = await fetch(`/api/empresas/${id}`);
      
      if (!res.ok) {
        throw new Error('Erro ao buscar empresa');
      }

      const data = await res.json();
      setEmpresa(data);
      setName(data.name);
      setCnpj(data.cnpj);
      setPrioridade(String(data.prioridade) as Hotline);
      setDataInicio(data.data_inicio_prioridade ?? '');
      setDataFim(data.data_fim_prioridade ?? '');
    } catch (err) {
      setError('Não foi possível carregar os dados da empresa');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    fetchEmpresa();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Carregando cadastro...</p>
      </Layout>
    );
  }

  if (error || !empresa) {
    return (
      <Layout>
        <p className="text-red-500">{error ?? 'Empresa não encontrada'}</p>
      </Layout>
    );
  }

  async function handleSave() {
    if (prioridade === '1' && !dataInicio) {
      toast.error('Informe a data de início do Hot-line');
      return;
    }

    if (prioridade === '1' && dataFim && dataFim < hoje()) {
      toast.error('A data fim não pode ser anterior a hoje');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/empresas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cnpj, prioridade, data_inicio_prioridade: dataInicio, data_fim_prioridade: dataFim }),
      });

      if (!res.ok) throw new Error();

      await fetchEmpresa();
      setEditing(false);
      toast.success('Alterações salvas com sucesso!')
    } catch {
      toast.error('Erro ao salvar alterações');
    }finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-black"
          >
            <MdArrowBack size={20} />
          </button>

          <h1 className="text-xl font-semibold text-gray-700">
            {empresa.name}
          </h1>

          {temPrioridade && (
            <div 
              className="ml-2 flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-white font-semibold text-sm"
              title="Chamado prioritário" 
            >
              <MdWarningAmber className="text-lg flex-shrink-0" />
              <span>Hot-line</span>
            </div>
          )}
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-1.5 bg-[#3f7a49] text-white rounded text"
          >
            Editar
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 bg-[#3f7a49] text-white rounded"
            >
              Salvar
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setName(empresa.name);
                setCnpj(empresa.cnpj);
                setPrioridade(empresa.prioridade as Hotline);
                setDataInicio(empresa.data_inicio_prioridade ?? '');
                setDataFim(empresa.data_fim_prioridade ?? '');
              }}
              className="px-4 py-1.5 border border-red-400 text-red-600 rounded"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
      
      {!editing && (
        <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded border mb-4">
          <Info label="Nome" value={empresa.name} />
          <Info label="Hot-line" value={statusHotline(empresa)} />
          <Info label="CNPJ" value={empresa.cnpj} />
          <Info label="Data Início Hot-line" value={formatDate(empresa.data_inicio_prioridade) || '-'} />
          <Info label="Cadastrada em" value={formatDateTime(empresa.created_at)} />
          <Info label="Data Fim Hot-line" value={formatDate(empresa.data_fim_prioridade) || (empresa.prioridade === '1' ? 'Indeterminado' : '-')} />
        </div>
      )}
        {editing && podeEditar && (
          <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded border mb-4">
            <div>
              <span className='text-sm text-gray-500'>Nome</span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-6"
              />
            </div>
            <label className='flex items-center gap-2 text-sm text-gray-500'>
              <input
                type="checkbox"
                checked={prioridade === '1'}
                onChange={(e) => {
                  const marcado = e.target.checked;
                  setPrioridade(marcado ? '1' : '0');
                  if (marcado) {
                    if (!dataInicio) setDataInicio(hoje());
                  } else {
                    setDataInicio('');
                    setDataFim('');
                  }
                }}
                className="w-4 h-4"
              />
              Hot-line
            </label>
            <div>
            <span className='text-sm text-gray-500'>CNPJ</span>
              <IMaskInput
                mask='00.000.000/0000-00'
                value={cnpj}
                onAccept={(value) => setCnpj(value)}
                className='w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-6'
                required
              />
            </div>
            {prioridade === '1' && (
              <div>
                <span className='text-sm text-gray-500'>Data Início Hot-line<span className="text-red-600">*</span></span>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                  required
                  className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-6"
                />
              </div>
            )}
            {prioridade === '0' && (
              <Info label="Data Início Hot-line" value='-' />
            )}
            <Info label="Cadastrada em" value={formatDateTime(empresa.created_at)} />
            {prioridade === '1' && (
              <div>
                <span className='text-sm text-gray-500'>Data Fim Hot-line</span>
                <input
                  type="date"
                  value={dataFim}
                  min={dataInicio > hoje() ? dataInicio : hoje()}
                  onChange={e => setDataFim(e.target.value)}
                  className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2"
                />
                <p className='text-sm text-gray-400 mt-1'>Caso essa data não seja preenchida, o período será indeterminado.</p>
              </div>
            )}
            {prioridade === '0' &&(
              <Info label="Data Fim Hot-line" value='-' />
            )}
          </div>
        )}
    </Layout>
  );
}

export function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-gray-500">{label}</span>
      <p className="font-medium text-gray-400">{value}</p>
    </div>
  );
}

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

function formatDate(d?: string | null) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function statusHotline(e: Empresa) {
  if (e.prioridade !== '1') return 'Não';
  const h = hoje();
  if (e.data_fim_prioridade && e.data_fim_prioridade < h) return 'Encerrado';
  if (e.data_inicio_prioridade && e.data_inicio_prioridade > h) return 'Agendado';
  return 'Ativo';
}