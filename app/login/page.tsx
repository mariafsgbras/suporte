'use client';

import Image from 'next/image';
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Usuário ou senha inválidos");
    } else {
      router.push("/chamados");
    }
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
            <h1 className="text-3xl font-semibold text-gray-800 mb-8">
              Bem-vindo(a) ao Suporte SGBras!
            </h1>

            <form onSubmit={handleLogin} className="space-y-4 max-w-sm">

              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded border border-gray-300 text-gray-500 px-3 py-2"
                  required
                />
                {/*<button 
                  type='button'
                  className='text-gray-400 text-xs'
                  onClick={() => (router.push('senha/esqueci-senha'))}
                >
                  Esqueci a senha
                </button>*/}
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                disabled={loading}
                className="w-full bg-[#3f7a49] text-white p-2 rounded disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className='mt-8 '>
                <h1 className="text-sm font-semibold text-gray-600 justify mb-1">
                  Ainda não possui uma conta? Clique abaixo para criar.
                </h1>
                <button
                  onClick={() => router.push('cadastro/empresa')}
                  className="w-full bg-[#3f7a49] text-white p-2 rounded disabled:opacity-50 mb-2"
                >
                  Criar conta
                </button>
                <button
                  onClick={() => router.push('chamado-sem-cadastro/novo')}
                  className="w-full bg-[#efefef] border border-[#3f7a49] text-[#3f7a49] p-2 rounded disabled:opacity-50"
                >
                  Abrir chamado sem cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}