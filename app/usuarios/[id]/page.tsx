'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { MdArrowBack } from 'react-icons/md';
import { useSession } from "next-auth/react";
import { ResetPasswordModal } from '@/components/ResetPasswordModel';
import toast from 'react-hot-toast';

type UserActive = 1 | 0;

type User = {
    id: number;
    name: string;
    company: string;
    email: string;
    phone: string;
    role: string;
    active: UserActive;
    created_at: string;
    updated_at: string;
};

export default function UserPage() {
  const { data: session } = useSession();

  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showResetModal, setShowResetModal] = useState(false);
  const [reseting, setReseting] = useState(false);

  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState<UserActive>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchUser() {
      try {
        setLoading(true);
        const res = await fetch(`/api/usuarios/${id}`);
        

        if (!res.ok) {
          throw new Error('Erro ao buscar chamado');
        }

        const data = await res.json();
        setUser(data);
        setActive(data.active);
      } catch (err) {
        setError('Não foi possível carregar os dados do usuário');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Carregando usuário...</p>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <p className="text-red-500">{error ?? 'Usuário não encontrado'}</p>
      </Layout>
    );
  }

  async function handleSave() {
    try {
      setSaving(true);

      await fetch(`/api/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
      });

      setUser((prev) =>
      prev ? { ...prev, active } : prev
      );

      setEditing(false);
      toast.success('Alterações salvas com sucesso!')
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!session) return;

    try {
      setReseting(true);
      
      const res = await fetch(`/api/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetPassword: true }),
      });

      if (!res.ok) throw new Error();

      setShowResetModal(false);
      toast.success('Senha resetada com sucesso!');
    } catch {
      toast.error("Erro ao redefinir senha.");
    } finally {
      setReseting(false);
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
            {user.name}
          </h1>

          <StatusBadge status={user.active} />
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
              onClick={() => setShowResetModal(true)}
              className="px-4 py-1.5 bg-blue-600 text-white rounded"
            >
              Resetar senha
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-[#3f7a49] text-white rounded"
            >
              Salvar
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setActive(user.active);
              }}
              className="px-4 py-1.5 border border-red-400 text-red-600 rounded"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded border mb-4">
        <Info label="Nome" value={user.name} />
        <Info label="Cadastrado em" value={formatDateTime(user.created_at)} />
        <Info label="Empresa" value={user.company} />
        <Info label="Atualizado em" value={formatDateTime(user.updated_at || '-')} />
        <Info label="Email" value={user.email} />
        <Info label="Função" value={user.role} />
        <Info label="Telefone" value={user.phone} />
        {editing && (
          <div>
            <span className="text-sm text-gray-500">Ativo?</span>
            <div className="mt-1">
              <input
                type="checkbox"
                checked={active === 1}
                onChange={(e) => setActive(e.target.checked ? 1 : 0)}
                className="w-4 h-4"
              />
            </div>
          </div>
        )}
      </div>
  
      <ResetPasswordModal
        open={showResetModal}
        title="Resetar Senha"
        message={`Deseja realmente resetar a senha do usuário ${user.name}?`}
        confirmText="Resetar"
        loading={reseting}
        onConfirm={handleResetPassword}
        onCancel={() => setShowResetModal(false)}
      />
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

export function StatusBadge({ status }: { status: UserActive }) {
  const styles = {
    0: 'border-red-500 text-red-600',
    1: 'border-green-500 text-green-600',
  };

  const label = {
    1: 'Ativo',
    0: 'Inativo',
  };

  return (
    <span
      className={`px-3 py-1 border rounded text-sm ${styles[status]}`}
    >
      {label[status]}
    </span>
  );
}

