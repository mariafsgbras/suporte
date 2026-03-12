'use client';

type WarningModalProps = {
  open: boolean;
  title: string;
  message: string;
  okText?: string;
  onOk: () => void;
};

export function WarningModal({
  open,
  title,
  message,
  okText = 'Ok',
  onOk,
}: WarningModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {title}
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onOk}
            className="px-4 py-2 rounded border text-[#3f7a49] hover:bg-gray-100"
          >
            {okText}
          </button>
        </div>
      </div>
    </div>
  );
}
