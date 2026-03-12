'use client';

import Image from 'next/image';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IMaskInput } from 'react-imask';

export default function RegisterPage() {
  const router = useRouter();

  const [cnpj, setCnpj] = useState("");
  const [empresa, setEmpresa] = useState<any>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificado, setVerificado] = useState(false);

  async function handleRegister() {
    if (!nomeEmpresa) {
      setError('Informe o nome da empresa');
      return;
    }

    setLoading(true);
    setError('');

    try {
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
        setError(data.message || 'Erro ao criar empresa');
        return;
      }

      router.push(`/cadastro/usuario?empresa_id=${data.empresa_id}`);

    } catch {
      setError('Erro ao criar empresa');
    } finally {
      setLoading(false);
    }
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

  function continuarCadastro() {
    console.log('info empresa:', empresa.id, empresa.nome, empresa.created_at)
    router.push(`/cadastro/usuario?empresa_id=${empresa.id}`);
  }

  useEffect(() => {
    if (!cnpj) return;

    if (!isValidCnpj(cnpj)) {
      setError('CNPJ inválido');
      setEmpresa(null);
      setVerificado(false);
      return;
    }
    setError('');
  }, [cnpj]);

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
            <h1 className="text-3xl font-semibold text-gray-800 mb-8">
              Nova conta
            </h1>

            <div className="max-w-sm w-full">
              <label className="text-sm font-semibold text-gray-600 justify mb-1">
                Digite o CNPJ da empresa
              </label>
              <IMaskInput
                mask='00.000.000/0000-00'
                value={cnpj}
                onAccept={(value) => {
                  setCnpj(value);
                  setVerificado(false);
                }}
                className='w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-6'
                required
              />
              <button
                onClick={checkCnpj}
                disabled={loading || (verificado && !empresa) || (verificado && empresa) || (!isValidCnpj(cnpj))}
                className="w-full bg-[#3f7a49] text-white p-2 rounded disabled:opacity-50 mb-4"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>

              {verificado && !empresa && cnpj &&(
                <p className="text-sm text-gray-400 justify mb-4 mt-2">CNPJ não cadastrado.</p>
              )}
            </div>

            {empresa && (
              <div className="bg-white border rounded p-4 space-y-3 mt-8 max-w-sm w-full">
                <p className="text-sm text-gray-700">
                  <strong>Empresa:</strong> {empresa.nome}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Cadastrada em:</strong>{' '}
                  {new Date(empresa.created_at).toLocaleDateString()}
                </p>

                <button
                  onClick={continuarCadastro}
                  className='w-full bg-[#3f7a49] text-white p-2 rounded'
                >
                  Continuar cadastro de usuário
                </button>
              </div>
            )}

            {verificado && !empresa && cnpj &&(
              <div className="max-w-sm w-full">
                <label className="text-sm font-semibold text-gray-600 justify mb-1">
                  Nome da empresa
                </label>
                <input
                  type="text"
                  value={nomeEmpresa}
                  onChange={e => setNomeEmpresa(e.target.value)}
                  className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2 mb-6"
                />
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-[#3f7a49] text-white p-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Criando empresa...' : 'Cadastrar empresa'}
                </button>
              </div>
            )}

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
