'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useParams, useSearchParams } from 'next/navigation';
import{ useRouter } from 'next/navigation';
import { MdArrowBack } from 'react-icons/md';
import { useSession } from "next-auth/react";
import { TicketActions } from '@/components/TicketActions';
import { Toast } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';
import { WarningModal } from '@/components/WarningModal';

type TicketStatus = 'open' | 'in_progress' | 'closed';

type Ticket = {
  id: number;
  company: string;
  cnpj: string;
  requester: string;
  requester_email: string;
  requester_phone: string;
  responsible?: string | null;
  product: string;
  description: string;
  opened_at: string;
  closed_at?: string | null;
  updated_at: string;
  status: TicketStatus;
  atendimento_tipo: string | null;
  responsavel_id: number;
  classificacao_id: number;
};

type Comment = {
  id: number;
  autor: string;
  mensagem: string;
  created_at: string;
};

export default function ChamadoPage() {
  const { data: session } = useSession();
  const isCliente = session?.user.role === "cliente";
  const hasActions = !isCliente;

  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [type, setType] = useState<string>('');
  const [novoResponsavel, setNovoResponsavel] = useState<string>('');

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [assuming, setAssuming] = useState(false);
  const [closing, setClosing] = useState(false);
  const [editing, setEditing] = useState(false);

  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [editToast, setEditToast] = useState(false);
  const [showTypeMessage, setShowTypeMessage] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchTicket() {
      try {
        const res = await fetch(`/api/chamados/${id}`);

        if (!res.ok) {
          throw new Error('Erro ao buscar chamado');
        }

        const data = await res.json();
        setTicket(data);
      } catch (err) {
        setError('Não foi possível carregar o chamado');
      } finally {
        setLoading(false);
      }
    }

    async function fetchComments() {
      const res = await fetch(`/api/chamados/${id}/comentario`);
      if (res.ok) {
        setComments(await res.json());
      }
    }

    fetchTicket();
    fetchComments();
  }, [id]);

  useEffect(() => {
    if (editing && ticket) {
      setNovoResponsavel(
        ticket.responsavel_id ? String(ticket.responsavel_id) : ''
      );
      setType(
        ticket.classificacao_id ? String(ticket.classificacao_id) : ''
      );
    }
  }, [editing, ticket]);

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Carregando chamado...</p>
      </Layout>
    );
  }

  if (error || !ticket) {
    return (
      <Layout>
        <p className="text-red-500">{error ?? 'Chamado não encontrado'}</p>
      </Layout>
    );
  }

  async function handleAssume(){
    if (!session || isCliente) return;

    /*if(!type) {
      setShowTypeMessage(true);
      return;
    }*/

    try{
      setAssuming(true);
      const res = await fetch(`/api/chamados/${id}/assumir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipoAtendimento: Number(type),
        }),
      });

      if(!res.ok){
        throw new Error();
      }

      const updated = await res.json();
      setTicket(updated);
    }catch {
      alert('Erro ao assumir o chamado')
    }finally {
      setAssuming(false);
    }
  }

  async function handleAddComment() {
    if (!session || isCliente) return;
    if (!commentText.trim()) return;

    const res = await fetch(`/api/chamados/${id}/comentario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem: commentText }),
    });

    if (!res.ok) {
      alert('Erro ao salvar comentário');
      return;
    }

    setCommentText('');
    setShowCommentBox(false);

    const updated = await fetch(`/api/chamados/${id}/comentario`);
    setComments(await updated.json());
  }

  function handleRequestClose() {
    setShowCloseModal(true);
  }

  async function handleConfirmClose() {
    if (!session || isCliente) return;
    if(comments.length === 0) {
      setShowWarningModal(true);
      setShowCloseModal(false);
      return;
    }
    try {
      setClosing(true);

      const res = await fetch(`/api/chamados/${id}/encerrar`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error();

      const updated = await res.json();
      setTicket(updated);

      setShowCloseModal(false);
      setShowToast(true);

      setTimeout(() => setShowToast(false), 3000);
    } catch {
      alert('Erro ao encerrar chamado');
    } finally {
      setClosing(false);
    }
  }

  /*async function handleEdit() {
    if (!editing) {
      setEditing(true);
      setNovoResponsavel(ticket?.responsavel_id ? String(ticket.responsavel_id) : '');
      setType(String(ticket?.classificacao_id ?? ''));
      return;
    }

    try {
      const res = await fetch(`/api/chamados/${id}/editar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(novoResponsavel && { responsavel_id: Number(novoResponsavel) }),
          ...(type && { classificacao_id: Number(type) })
        }),
      });

      if (!res.ok) throw new Error();

      const updated = await res.json();

      setTicket(updated);
      setEditing(false);
      setEditToast(true);
      setTimeout(() => setEditToast(false), 3000);
    } catch {
      alert('Erro ao salvar alterações');
    }
  }

  function handleCancel() {
    setEditing(false);
    setNovoResponsavel(ticket?.responsavel_id ? String(ticket.responsavel_id) : '');
    setType(String(ticket?.classificacao_id ?? ''));
  }*/

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (from) {
                    router.push(from);
                  } else {
                    router.push('/chamados');
                  }
                }}
                className="flex items-center gap-1 text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                <MdArrowBack size={18} className="text-gray-600 hover:bg-[#3f7a49] hover:text-white rounded" />
              </button>
              <h1 className="text-xl font-semibold text-gray-400">
                Chamado {ticket.id}
              </h1>
              <StatusBadge status={ticket.status} />
          </div>
          {hasActions && (
            <TicketActions 
              status={ticket.status}
              onAssume={handleAssume}
              onClose={handleRequestClose}
              onAddComment={handleAddComment}
              assuming={assuming}
              closing={closing}
              //onEdit={handleEdit}
              canEdit={!isCliente}
              editing={editing}
              //onCancel={handleCancel}
            />
            
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded border text-gray-400">
          <Info label="Empresa" value={ticket.company} />
          <Info label="Data de Abertura" value={formatDateTime(ticket.opened_at)} />
          <Info label="CNPJ" value={ticket.cnpj} />
          <Info label="Início Atendimento" value={formatDateTime(ticket.updated_at)} />
          <Info label="Solicitante" value={ticket.requester} />
          <Info label="Data de Fechamento" value={formatDateTime(ticket.closed_at ?? '-')} />
          <Info label="Email" value={ticket.requester_email} />
          {!editing && (
            <Info label="Responsável" value={ticket.responsible ?? '-'} /> 
          )}
          {/*{editing && (
            <div>  
              <h3 className="text-sm text-gray-500">Responsável</h3>
              <select
                value={novoResponsavel}
                onChange={(e) => setNovoResponsavel(e.target.value)}
                className="border rounded p-2 text-gray-600 text-sm"
              >
                <option value={ticket.responsavel_id}>
                  Atual: {ticket.responsible}
                </option>
                <option value="5">Arthur Santos</option>
                <option value="6">João Pedro Alves</option>
                <option value="3">João Pedro Morais</option>
                <option value="1">Maria Fernanda Rabelo</option>
                <option value="2">Matheus Campos</option>
              </select>

            </div>  
          )}*/}
          <Info label="Telefone" value={ticket.requester_phone} />
        </div>

        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2 text-gray-700">Produto</h3>
          <p className="text-gray-700 text-sm pb-4">{ticket.product}</p>
          <h3 className="font-semibold mb-2 text-gray-700">Solicitação</h3>
          <p className="text-gray-700 text-sm pb-4">{ticket.description}</p>
          {/*{hasActions && ticket.status === 'open' &&(
            <div>  
              <h3 className="font-semibold mb-2 text-gray-700">Tipo de Atendimento
                <span className='text-red-500'> *</span>
              </h3>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border rounded p-2 text-gray-600 text-sm"
              >
                <option value="">Selecione</option>
                <option value="1">Configuração</option>
                <option value="2">Erro</option>
                <option value="7">Dúvida</option>
                <option value="3">Instalação</option>
                <option value="6">Plataforma</option>
                <option value="4">Script</option>
                <option value="5">Treinamento</option>
              </select>
            </div>  
          )} */}
          {/*{hasActions && ticket.status !== 'open' && !editing && (
            <div>  
              <h3 className="font-semibold mb-2 text-gray-700">Tipo de Atendimento</h3> 
              <p className="text-gray-700 text-sm pb-1">{ticket.atendimento_tipo ?? '-'}</p>
            </div>  
          )} 
          {hasActions && editing && ticket.status == 'in_progress' && (
            <div>  
              <h3 className="font-semibold mb-2 text-gray-700">Tipo de Atendimento</h3>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border rounded p-2 text-gray-600 text-sm"
              >
                <option value={ticket.classificacao_id}>
                  Atual: {ticket.atendimento_tipo}
                </option>
                <option value="1">Configuração</option>
                <option value="2">Erro</option>
                <option value="7">Dúvida</option>
                <option value="3">Instalação</option>
                <option value="6">Plataforma</option>
                <option value="4">Script</option>
                <option value="5">Treinamento</option>
              </select>
            </div>  
          )}*/}
        </div>    

        {hasActions && (
          <div className="bg-white p-4 rounded border">
            <div className="flex itens-center justify-between">
              <h3 className="font-semibold mb-2 text-gray-700">Comentários</h3>
            
              {ticket.status !== 'closed' && hasActions && (
                <button 
                  onClick={() => setShowCommentBox(true)}
                  className="bg-green-600 mt-3 text-sm text-white-700 font-medium rounded px-3 py-1"
                  >
                    Novo comentário
                </button>
              )}
            </div>
            
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500 pt-4">
                Nenhum comentário ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="text-gray-700 text-sm gap-1">
                    <div className="text-gray-700 text-sm flex gap-1">
                      <strong>{c.autor}</strong>{' '}
                      <span className="text-gray-400 text-sm flex">
                        {formatDateTime(c.created_at)}
                        <p>: </p>
                        
                      </span>
                    </div>
                    <p className="text-gray-600 ">{c.mensagem}</p>
                  </div>
                  
                ))}
              </div>
            )}

            {showCommentBox && (
              <div className="mt-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full border rounded p-2 text-sm text-gray-500"
                  placeholder="Digite seu comentário..."
                />

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setShowCommentBox(false)}
                    className="text-sm px-3 py-1 border rounded bg-red-500"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleAddComment}
                    className="text-sm px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Salvar comentário
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={showCloseModal}
        title="Encerrar chamado"
        message={`Deseja realmente encerrar o chamado ${ticket.id}?`}
        confirmText="Encerrar"
        loading={closing}
        onConfirm={handleConfirmClose}
        onCancel={() => setShowCloseModal(false)}
      />

      <Toast
        show={showToast}
        message={`O chamado ${ticket.id} foi encerrado com sucesso.`}
      />

      <WarningModal
        open={showWarningModal}
        title="Aviso"
        message={'É necessário adicionar pelo menos um comentário para encerrar o chamado.'}
        okText='Ok'
        onOk={() => setShowWarningModal(false)}
      />

      {/*<Toast
        show={editToast}
        message={`Alterações salvas com sucesso!`}
      />*/}

      {/*<WarningModal
        open={showTypeMessage}
        title="Aviso"
        message={'Informe o tipo de atendimento para assumir o chamado.'}
        okText='Ok'
        onOk={() => setShowTypeMessage(false)}
      />*/}
    </Layout>
  );
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const styles = {
    open: 'border-red-500 text-red-600',
    in_progress: 'border-yellow-500 text-yellow-600',
    closed: 'border-green-500 text-green-600',
  };

  const label = {
    open: 'Aberto',
    in_progress: 'Em andamento',
    closed: 'Fechado',
  };

  return (
    <span
      className={`px-3 py-1 border rounded text-sm ${styles[status]}`}
    >
      {label[status]}
    </span>
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