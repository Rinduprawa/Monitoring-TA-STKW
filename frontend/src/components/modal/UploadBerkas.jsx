// src/components/mahasiswa/ModalUploadBerkas.jsx

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function UploadBerkas({ 
  isOpen, 
  jenisDokumen, 
  existingBerkas, 
  onClose, 
  onSuccess 
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const labelMap = {
    naskah_skripsi: 'Naskah Skripsi',
    deskripsi_karya_seni: 'Deskripsi Karya Seni',
    dokumentasi_pergelaran: 'Dokumentasi Foto & Video Pergelaran',
  };

  const acceptMap = {
    naskah_skripsi: '.pdf',
    deskripsi_karya_seni: '.pdf,.doc,.docx',
    dokumentasi_pergelaran: '.zip,.rar',
  };

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setError('');
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!file && !existingBerkas) {
      setError('Pilih file terlebih dahulu');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('jenis_dokumen', jenisDokumen);
      if (file) {
        formData.append('file', file);
      }

      if (existingBerkas) {
        // Update existing
        await api.post(`/berkas-ta/${jenisDokumen}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Berkas berhasil diperbarui');
      } else {
        // Create new
        await api.post('/berkas-ta', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Berkas berhasil diunggah');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to upload:', error);
      setError(error.response?.data?.message || 'Gagal mengunggah berkas');
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
          <h3 className="text-lg font-semibold text-gray-800">
            {existingBerkas ? 'Edit' : 'Unggah'} {labelMap[jenisDokumen]}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {existingBerkas && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-300">
              <p className="text-sm font-medium text-gray-700 mb-1">File saat ini:</p>
              <p className="text-sm text-gray-600">{existingBerkas.file_path.split('/').pop()}</p>
            </div>
          )}

          <label className="block mb-2 text-sm font-medium text-gray-800">
            {existingBerkas ? 'Ganti dengan file baru:' : 'Pilih file:'}
          </label>
          <input
            type="file"
            accept={acceptMap[jenisDokumen]}
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format yang diizinkan: {acceptMap[jenisDokumen].replace(/\./g, '').replace(/,/g, ', ')}
          </p>

          {file && (
            <p className="text-green-600 text-sm mt-2">✓ {file.name}</p>
          )}

          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
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
            disabled={loading || (!file && !existingBerkas)}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Mengunggah...' : existingBerkas ? 'Perbarui' : 'Unggah'}
          </button>
        </div>
      </div>
    </div>
  );
}