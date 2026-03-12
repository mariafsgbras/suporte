'use client';

import { Layout } from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function NovoChamadoPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [product, setProduct] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successId, setSuccesId] = useState<number | null>(null);

  if (status === 'loading') {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  if (!session || !session.user) {
    router.push('/login');
    return null;
  }
  
  const user = session.user;

  async function handleSubmit() {
    try {
      setLoading(true);

      const res = await fetch('/api/chamados/novo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          description,
        }),
      });

      if (!res.ok) {
        throw new Error('Erro ao abrir chamado');
      }

      const data = await res.json();
      setSuccesId(data.id);

    } catch {
      alert('Não foi possível abrir o chamado');
    } finally {
      setLoading(false);
    }
  }

  if (successId) {
    return (
      <Layout>
        <div className="max-w-lg bg-green-50 border border-green-200 p-6 rounded">
          <h2 className="text-lg font-semibold text-green-700 mb-2">
            Chamado aberto com sucesso!
          </h2>

          <p className="text-sm text-gray-700 mb-4">
            O chamado <strong>{successId}</strong> foi aberto e em breve
            um de nossos atendentes entrará em contato pelo WhatsApp.
          </p>

          <p className="text-sm text-gray-700">
            <strong>Horário de Funcionamento:</strong><br></br>
            Segunda à quinta: 07h às 17h<br></br>
            Sexta-feira: 07h às 16h
          </p>

          <button
            onClick={() => router.push('/chamados')}
            className="mt-4 px-4 py-2 bg-[#3f7a49] text-white rounded"
          >
            Ver meus chamados
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-xl font-semibold text-gray-800 mb-2">
        Novo Chamado
      </h1>

      <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded border text-gray-400 mb-5">
        <Info label="Solicitante" value={user.name ?? ''}/>
        <Info label="Empresa" value={user.empresa_nome ?? ''} />
        <Info label="Email" value={user.email ?? ''} />
        <Info label="Telefone" value={user.phone ?? ''} />
      </div>

      <div className="space-y-4 mb-6 text-gray-600">
        <select
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className="w-full border rounded p-2 text-gray-600"
        >
          <option value="">Selecione o produto</option>
          <option value="3">Auxiliar de Bordo</option>
          <option value="7">Bloqueador - SW403</option>
          <option value="5">Galileosky</option>
          <option value="1">Leitor RFID</option>
          <option value="4">Mão Amiga</option>
          <option value="6">Sensor de Fadiga - SF04A</option>
          <option value="9">Sensor de Temperatura</option>
          <option value="8">SW101</option>
          <option value="2">Teclado</option>
          <option value="10">Telemetria</option>
          <option value="11">Outro</option>
        </select>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full border rounded p-2 text-gray-600"
          placeholder="Descreva sua solicitação"
        />
      </div>

      <div className="flex gap-3 text-gray-600">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded"
        >
          Cancelar
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading || !product || !description}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Abrindo...' : 'Abrir chamado'}
        </button>
      </div>
    </Layout>
  );
}
export function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-gray-500">{label}</span>
      <p className="font-medium">{value}</p>
    </div>
  );
}