"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ConfirmationModal({
  isOpen,
  onClose,
  title = "Confirm Action",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  loading = false,
}) {
  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-6">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>

        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200  rounded-lg hover:bg-gray-100"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
