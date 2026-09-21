// components/ConfirmationModal.jsx
export default function ConfirmationModal({
  isOpen,
  title = "Confirmer l'action",
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  confirmColor = "red", // red | blue | green | amber
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const colors = {
    red: "bg-red-600 hover:bg-red-500 focus:ring-red-500",
    blue: "bg-blue-600 hover:bg-blue-500 focus:ring-blue-500",
    green: "bg-green-600 hover:bg-green-500 focus:ring-green-500",
    amber: "bg-amber-600 hover:bg-amber-500 focus:ring-amber-500",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-900 border border-blue-900  focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${colors[confirmColor]}`}
          >
            {isLoading ? "Chargement..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}