// src/components/kaprodi/ModalAssignPenguji.jsx

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ModalAssignPenguji({ isOpen, onClose, jadwalId, onSuccess }) {
  const [selectedPenguji, setSelectedPenguji] = useState([]);
  const [dosenOptions, setDosenOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDosenOptions();
    }
  }, [isOpen]);

  const fetchDosenOptions = async () => {
    try {
      // Endpoint dosen yang sudah ditugaskan sebagai penguji
      const response = await api.get('/kaprodi/dosen-penguji');
      setDosenOptions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dosen:', error);
    }
  };

  const handleToggleDosen = (dosenId) => {
    setSelectedPenguji(prev => 
      prev.includes(dosenId)
        ? prev.filter(id => id !== dosenId)
        : [...prev, dosenId]
    );
  };

  const handleSubmit = async () => {
    if (selectedPenguji.length === 0) {
      alert('Pilih minimal 1 dosen penguji');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/kaprodi/jadwal-ujian/${jadwalId}/assign-penguji`, {
        penguji_ids: selectedPenguji
      });
      
      alert('Penguji berhasil ditambahkan');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to assign penguji:', error);
      alert(error.response?.data?.message || 'Gagal menambahkan penguji');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white max-w-md w-full mx-4">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Pilih Dosen Penguji</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {dosenOptions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Belum ada dosen yang ditugaskan sebagai penguji
            </p>
          ) : (
            <div className="space-y-2">
              {dosenOptions.map((dosen) => (
                <label
                  key={dosen.id}
                  className="flex items-center gap-3 p-3 border border-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPenguji.includes(dosen.id)}
                    onChange={() => handleToggleDosen(dosen.id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{dosen.nama}</p>
                    <p className="text-sm text-gray-500">{dosen.nip}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || dosenOptions.length === 0}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}