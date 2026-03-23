'use client';

type Props = {
  status: "open" | "in_progress" | "closed";
  onAssume: () => void;
  onClose: () => void;
  onAddComment: () => void;
  assuming?: boolean;
  closing?: boolean;
  //onEdit: () => void;
  canEdit?: boolean;
  editing?: boolean;
  onCancel?: () => void;
};

export function TicketActions({
  status,
  onAssume,
  onClose,
  onAddComment,
  assuming,
  closing,
  //onEdit,
  canEdit,
  editing,
  //onCancel
}: Props) {
  if (status === "closed") return null;

  return (
    <div className="flex gap-2">
      {status === "open" && (
        <button
          onClick={onAssume}
          disabled={assuming}
          className={`text-white px-4 py-2 rounded
             ${assuming ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'}
            `}
        >
          {assuming ? 'Assumindo...' : 'Assumir'}
        </button>
      )}

      {/*{canEdit && !editing && status === 'in_progress' && (
        <button
          onClick={onEdit}
          className="px-4 py-1.5 bg-[#3f7a49] text-white rounded text"
        >
          Editar
        </button>
      )}

      {canEdit && editing && (
        <>
          <button onClick={onEdit} className="px-4 py-2 rounded bg-blue-600 text-white">
            Salvar
          </button>
          <button onClick={onCancel} className="px-4 py-2 rounded bg-red-600 order">
            Cancelar
          </button>
        </>
      )}*/}

      {status === "in_progress" && (
        <>
          <button
            onClick={onClose}
            disabled={closing}
            className={`px-4 py-2 rounded
              ${closing
                ? 'border border-gray-400 text-gray-400 cursor-not-allowed'
                : 'border border-red-500 text-red-600'
              }
            `}
          >
            {closing ? 'Encerrando...' : 'Encerrar chamado'}
          </button>
        </>
      )}
    </div>
  );
}
