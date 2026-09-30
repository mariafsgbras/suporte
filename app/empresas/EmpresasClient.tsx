'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { useSession } from "next-auth/react";

export type Hotline = "1" | "0";

interface Empresa {
  id: number;
  nome: string;
  prioridade_ativa: number | boolean | null;
}

const statusMap: Record<
  Hotline,
  { label: string; color: string }
> = {
  "0": { label: "Não", color: "text-gray-400" },
  "1": { label: "Sim", color: "text-red-600" },
};

export default function EmpresasPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    fetchEmpresas();
  }, [page, searchTerm]);

  async function fetchEmpresas() {
    setLoading(true);

    const res = await fetch(`/api/empresas?page=${page}&limit=${limit}&search=${searchTerm}`);
    console.log(res);

    const data = await res.json();
    console.log(data);

    setEmpresas(data.data);
    setTotal(data.total);
    setLoading(false);
  }

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (session && session.user.role === 'cliente') {
        router.replace('/chamados');
    }
  }, [session]);

  return (
    <Layout>
      <h1 className="text-xl text-gray-800 font-semibold mb-4">
        Empresas
      </h1>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Buscar empresa"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-gray-500 rounded border focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>
      
        {loading ? (
          <p className="text-gray-500">Carregando empresas...</p>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-left h-12">
                  <th className="px-4 w-10">ID</th>
                  <th className="px-4 w-74">Empresa</th>
                  <th className="px-4 w-32">Hot-line</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa) => {
                  const status = statusMap[empresa.prioridade_ativa ? '1' : '0'];

                  return (
                    <tr
                      key={empresa.id}
                      onClick={() => router.push(`/empresas/${empresa.id}`)}
                      className="h-12 cursor-pointer hover:bg-gray-100 text-gray-400 bg-gray-50"
                    >
                      <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{empresa.id}</td>
                      <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{empresa.nome}</td>
                      <td className={`px-4 whitespace-nowrap font-medium ${status.color}`}>
                        {status.label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>  
        )}
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(prev => prev - 1)}
          className="px-3 py-1 bg-[#3f7a49] rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="text-sm text-gray-500">
          Página {page} de {totalPages}
        </span>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(prev => prev + 1)}
          className="px-3 py-1 bg-[#3f7a49] rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </Layout>
  );
}