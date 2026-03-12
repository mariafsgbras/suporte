'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IMaskInput } from 'react-imask';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState<any>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [telefone, setTelefone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadEmpresa, setLoadingEmpresa] = useState(false);
  const [success, setSuccess] = useState(false);

  const empresaLoadedRef = useRef(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch('/api/cadastro/usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empresa_id: empresaId,
        nome,
        email,
        telefone,
        senha
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setSuccess(false);
      setError(data.message || 'Erro ao criar usuário. Email já cadastrado.');
      throw new Error("Não foi possível criar uma nova conta");
    } else {
      setLoading(false);
      setSuccess(true);
    }
  }

  async function getEmpresa(id: string){
    if(empresaLoadedRef.current) return;
    try{
      setLoadingEmpresa(true);
      const res = await fetch(`/api/cadastro/empresa?id=${id}`);
      const data = await res.json();

      if(data.existe){
        setEmpresa(data.empresa);
        setLoadingEmpresa(false);
      }else{
        setEmpresa(null);
      } 
    }catch (error) {
      console.error(error);
      setEmpresa(null);
    }finally {
      setLoadingEmpresa(false);
    }
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('empresa_id');
    setEmpresaId(id);
  }, []);

  useEffect(() => {
    if(empresaId && !empresaLoadedRef.current){
      getEmpresa(empresaId);
    }
  }, [empresaId]);

  if (success){
    return (
      <div className='min-h-screen bg-[#efefef]'>
        <header className='h-14 bg-[#3f7a49] flex items-center px-6 text-white font-semibold mb-10'>
          SGBras Suporte
        </header>
        <div className='flex justify-center items-center h-200'>
          <div className="max-w-lg bg-[#3f7a49] border border-green-200 p-6 rounded items-center">
            <h2 className="text-lg font-semibold text-[#3f7a49]-700 mb-2">
              Conta criada com sucesso!
            </h2>

            <p className="text-sm text-[#3f7a49]-400">
              Faça login para acessar e acompanhar os chamados.
            </p>

            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-[#efefef] text-[#3f7a49] rounded"
            >
              Fazer login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#efefef] flex flex-col">
      <header className="h-14 bg-[#3f7a49] flex items-center px-6 text-white font-semibold">
        SGBras Suporte
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-20 items-center">

          <div className="flex justify-center">
            <Image src="/logo-sgbras.png" alt="SGBras" width={420} height={420} priority />
          </div>

          <div>
            {loadEmpresa ? (
              <div className="bg-white border rounded p-4 space--y-3 mt-8">
                <p className="text-sm text-gray-700"> Carregando informações...</p>
              </div>
            ) : empresa ? (
              <div className="bg-white border rounded p-4 space-y-3 mt-8 mb-8 max-w-sm">
                <p className="text-sm text-gray-700">
                  <strong>Empresa:</strong> {empresa.nome}
                </p>

                <p className="text-sm text-gray-700">
                  <strong>CNPJ:</strong>{' '} {empresa.cnpj}
                </p>

                <p className="text-sm text-gray-700">
                  <strong>Cadastrada em:</strong>{' '}
                  {new Date(empresa.created_at).toLocaleDateString()}
                </p>
              </div> 
            ) : null}

            <h1 className="text-3xl font-semibold text-gray-800 mb-8">
              Nova conta
            </h1>

            <form onSubmit={handleRegister} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm text-gray-600 mt-1">Nome completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2"
                  required
                />
                <label className="block text-sm text-gray-600 mt-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2"
                  required
                />
                <label className="block text-sm text-gray-600 mt-1">Telefone</label>
                <IMaskInput
                  mask='(00)00000-0000'
                  value={telefone}
                  onAccept={(value) => setTelefone(value)}
                  className='w-full rounded border border-gray-300 text-gray-500 px-3 py-2'
                  required
                />
                <label className="block text-sm text-gray-600 mt-1">Senha</label>
                <input
                  type="password"
                  onChange={e => setSenha(e.target.value)}
                  className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-4"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                disabled={loading}
                className="w-full bg-[#3f7a49] text-white p-2 rounded disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar'}
              </button>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
