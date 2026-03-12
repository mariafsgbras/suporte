'use client';

type Props = {
  status: "open" | "in_progress" | "closed";
  onAssume: () => void;
  onClose: () => void;
  onAddComment: () => void;
  assuming?: boolean;
  closing?: boolean;
};

export function TicketActions({
  status,
  onAssume,
  onClose,
  onAddComment,
  assuming,
  closing
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
