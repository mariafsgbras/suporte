'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";

export type UserActive = 1 | 0;

interface User {
  id: number;
  nome: string;
  ativo: UserActive;
  empresa: string;
}

const statusMap: Record<
  UserActive,
  { label: string; color: string }
> = {
  0: { label: "Inativo", color: "text-red-600" },
  1: { label: "Ativo", color: "text-green-600" },
};

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  async function fetchUsers() {
    setLoading(true);

    const res = await fetch(`/api/usuarios?page=${page}&limit=${limit}&search=${searchTerm}`);

    const data = await res.json();

    setUsers(data.data);
    setTotal(data.total);
    setLoading(false);
  }

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  return (
    <Layout>
      <h1 className="text-xl text-gray-800 font-semibold mb-4">
        Usuários
      </h1>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Buscar usuário ou empresa"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-gray-500 rounded border focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>
      
        {loading ? (
          <p className="text-gray-500">Carregando usuários...</p>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-left h-12">
                  <th className="px-4 w-10">ID</th>
                  <th className="px-4 w-74">Usuário</th>
                  <th className="px-4 w-74">Empresa</th>
                  <th className="px-4 w-32">Ativo</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => router.push(`/usuarios/${user.id}`)}
                    className="h-12 cursor-pointer hover:bg-gray-100 text-gray-400 bg-gray-50"
                  >
                    <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{user.id}</td>
                    <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{user.nome}</td>
                    <td className="px-4 whitespace-nowrap truncate max-w-[160px]">{user.empresa}</td>
                    <td className={`px-4 whitespace-nowrap font-medium ${statusMap[user.ativo].color}`}>
                      {statusMap[user.ativo].label}
                    </td>
                  </tr>
                ))}
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
          disabled={page === totalPages}
          onClick={() => setPage(prev => prev + 1)}
          className="px-3 py-1 bg-[#3f7a49] rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </Layout>
  );
}