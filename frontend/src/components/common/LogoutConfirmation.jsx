// import { useState } from 'react';

function LogoutConfirmation({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Peringatan!</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gray-700">
            Apakah anda yakin ingin keluar dari sistem?
          </p>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ya
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirmation;