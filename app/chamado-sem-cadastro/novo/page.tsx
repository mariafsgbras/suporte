'use client';

import { Layout } from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { IMaskInput } from "react-imask";

export default function NovoChamadoSemCadastroPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [empresa, setEmpresa] = useState<any>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [product, setProduct] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificado, setVerificado] = useState(false);
  const [successId, setSuccesId] = useState<number | null>(null);

  useEffect(() => {
    if (!cnpj) return;

    if (!isValidCnpj(cnpj)) {
        setEmpresa(null);
        setVerificado(false);
        return;
    }

    setError('');
    checkCnpj();
  }, [cnpj]);

  if (status === 'loading') {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  function isValidCnpj(cnpj: string): boolean {
    if (!cnpj) return false;

    const cleaned = cnpj.replace(/\D/g, '');

    if (cleaned.length !== 14) return false;

    if (/^(\d)\1+$/.test(cleaned)) return false;
    const digits = cleaned.split('').map(Number);

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * weights1[i];
    }
    let remainder = sum % 11;
    const checkDigit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digits[12] !== checkDigit1) return false;

    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += digits[i] * weights2[i];
    }
    remainder = sum % 11;
    const checkDigit2 = remainder < 2 ? 0 : 11 - remainder;
    if (digits[13] !== checkDigit2) return false;
    return true;
  }

  async function checkCnpj(){
    if(!cnpj) return;

    setLoading(true);
    setError('');

    try{
      const res = await fetch(`/api/cadastro/empresa?cnpj=${cnpj}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Erro ao verificar CNPJ');
        setVerificado(true);
        return;
      }

      if(data.existe){
        setEmpresa(data.empresa);
      }else{
        setEmpresa(null);
      }

      setVerificado(true);

    }catch (err){
      setError('Erro de conexão com o servidor')
      setVerificado(true);
    }finally {
      setLoading(false);
    }
  }

  async function handleRegisterCompany() {
    const res = await fetch('/api/cadastro/empresa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      nome: nomeEmpresa,
      cnpj,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Erro ao criar empresa');
    }
    
    return data.empresa_id;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    try {
      setLoading(true);

      const empresaId = empresa?.id ?? await handleRegisterCompany();

      const res = await fetch('/api/chamado-sem-cadastro/novo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          description,
          nome,
          email,
          telefone,
          empresa_id: empresaId,
        }),
      });

      if (!res.ok) {
        throw new Error('Erro ao abrir chamado');
      }

      const data = await res.json();
      setSuccesId(data.id);
    } catch (err){
      console.log(err);
      alert('Não foi possível abrir o chamado');
    } finally {
      setLoading(false);
    }
  }

  const empresaValida = (empresa && empresa.id) || (!empresa && nomeEmpresa);

  if (successId) {
    return (
      <div className='min-h-screen bg-[#efefef]'>
        <header className='h-14 bg-[#3f7a49] flex items-center px-6 text-white font-semibold mb-10'>
          SGBras Suporte
        </header>
        <div className='flex justify-center items-center h-200'>
          <div className="max-w-lg bg-[#3f7a49] border border-green-200 p-6 rounded items-center">
            <h2 className="text-lg font-semibold text-[#3f7a49]-700 mb-2">
              Chamado aberto com sucesso!
            </h2>

            <p className="text-sm text-[#3f7a49]-400 mb-4">
              O chamado <strong>{successId}</strong> foi aberto e em breve
              um de nossos atendentes entrará em contato pelo WhatsApp.
            </p>
            <p className="text-sm text-[#3f7a49]-500 mb-4">
              <strong>Horário de Funcionamento:</strong><br></br>
              Segunda à quinta: 07h às 17h<br></br>
              Sexta-feira: 07h às 16h
            </p>
            <p className="text-sm text-gray-700">
              <strong>* Horário de Brasília </strong>
            </p>
            <p className="text-sm text-[#3f7a49]-400">
              Para visualizar o andamento dos chamados, é necessário criar uma conta.
            </p>
            <button
              onClick={() => router.push('/cadastro/empresa')}
              className="mt-4 px-4 py-2 bg-[#efefef] text-[#3f7a49] rounded"
            >
              Criar conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efefef]">
      <header className="h-14 bg-[#3f7a49] flex items-center px-6 text-white font-semibold">
        SGBras Suporte
      </header>

      <div className="px-6 p-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">
          Novo Chamado
        </h1>

        <div className='px-6 p-6 flex justify-center'>
          <div className="max-w-lg w-full">
            <label className="text-sm font-semibold text-gray-600 justify mb-1">
                CNPJ
                <span className='text-red-500'> *</span>
            </label>
            <IMaskInput
                mask='00.000.000/0000-00'
                value={cnpj}
                onAccept={(value) => {
                    setCnpj(value);
                    setVerificado(false);
                    setError('');
                }}
                className=
                  {`w-full rounded border text-gray-500 px-3 py-2 mb-2 ${
                    error ? 'border-red-300' : 'border-gray-300'
                  }`}
                required
            />
            {cnpj && !isValidCnpj(cnpj) && (
              <p className="text-xs text-red-500">
                CNPJ inválido
              </p>
            )}

            {error && (
              <p className="text-xs text-red-500">
                {error}
              </p>
            )}

            {verificado && !empresa && cnpj &&(
              <div className="max-w-lg w-full">
                <label className="text-sm font-semibold text-gray-600 justify mb-1">
                    Nome da empresa
                    <span className='text-red-500'> *</span>
                </label>
                <input
                  type="text"
                  value={nomeEmpresa}
                  onChange={e => setNomeEmpresa(e.target.value)}
                  className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-2"
                />
                <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                  <label className="text-sm font-semibold text-gray-600 justify mb-1 mt-1">Nome completo<span className='text-red-500'> *</span></label>
                  <input
                    type="text"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-2"
                    required
                  />
                  <label className="text-sm font-semibold text-gray-600 justify mb-1 mt-1">Email<span className='text-red-500'> *</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-2"
                    required
                  />
                  <label className="text-sm font-semibold text-gray-600 justify mb-1 mt-1">Telefone<span className='text-red-500'> *</span></label>
                  <IMaskInput
                    mask='(00)00000-0000'
                    value={telefone}
                    onAccept={(value) => setTelefone(value)}
                    className='w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-2'
                    required
                  />

                  <label className="text-sm font-semibold text-gray-600 justify mb-1 mt-1">Produto<span className='text-red-500'> *</span></label>
                  <select
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full border rounded p-2 text-gray-600 mb-4"
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

                  <label className="text-sm font-semibold text-gray-600 justify mb-1 mt-1">Solicitação<span className='text-red-500'> *</span></label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full border rounded p-2 text-gray-600"
                    placeholder="Descreva sua solicitação"
                  />

                  <div className="flex gap-3 text-gray-600">
                    <button
                      onClick={() => router.back()}
                      className="px-4 py-2 border rounded"
                    >
                      Cancelar
                    </button>

                    <button
                      type='submit'
                      disabled={loading || !product || !description || !nome || !email || !telefone || !empresaValida}
                      className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                    >
                      {loading ? 'Abrindo...' : 'Abrir chamado'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {empresa && (
              <div className="max-w-lg w-full">
                <label className="text-sm font-semibold text-gray-400 justify mb-1">
                    Nome da empresa
                </label>
                <p className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-2">
                  {empresa.nome}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                  <label className="text-sm font-semibold text-gray-600 justify mb-1 mt-1">Nome completo<span className='text-red-500'> *</span></label>
                  <input
                    type="text"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-2"
                    required
                  />
                  <label className="text-sm font-semibold text-gray-600 justify mb-1 mt-1">Email<span className='text-red-500'> *</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-2"
                    required
                  />
                  <label className="text-sm font-semibold text-gray-600 justify mb-1 mt-1">Telefone<span className='text-red-500'> *</span></label>
                  <IMaskInput
                    mask='(00)00000-0000'
                    value={telefone}
                    onAccept={(value) => setTelefone(value)}
                    className='w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-2'
                    required
                  />

                  <label className="text-sm font-semibold text-gray-600 justify mb-1 mt-1">Produto<span className='text-red-500'> *</span></label>
                  <select
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full border rounded p-2 text-gray-600 mb-4"
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

                  <label className="text-sm font-semibold text-gray-600 justify mb-1 mt-1">Solicitação<span className='text-red-500'> *</span></label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full border rounded p-2 text-gray-600"
                    placeholder="Descreva sua solicitação"
                  />

                  <div className="flex gap-3 text-gray-600">
                    <button
                      onClick={() => router.back()}
                      className="px-4 py-2 border rounded"
                    >
                      Cancelar
                    </button>

                    <button
                      type='submit'
                      disabled={loading || !product || !description || !nome || !email || !telefone || !empresa || !empresaValida}
                      className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                    >
                      {loading ? 'Abrindo...' : 'Abrir chamado'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div> 
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