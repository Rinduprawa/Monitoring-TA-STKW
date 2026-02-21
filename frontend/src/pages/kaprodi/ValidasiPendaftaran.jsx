// src/pages/kaprodi/ValidasiPendaftaran.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import FilePreviewModal from '../../components/modal/FilePreview';

export default function ValidasiPendaftaran() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [errors, setErrors] = useState({});
  const [pendaftaran, setPendaftaran] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [berkasStatus, setBerkasStatus] = useState({});
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });

  const fetchPendaftaran = useCallback(async () => {
    try {
      const response = await api.get(`/kaprodi/pendaftaran-ta/${id}`);
      const data = response.data.data;
      setPendaftaran(data);

      // Initialize berkas status
      const initialStatus = {};
      data.berkas_pendaftaran?.forEach(berkas => {
        initialStatus[berkas.id] = {
          is_valid: berkas.status === 'valid',
          catatan: berkas.catatan || ''
        };
      });
      setBerkasStatus(initialStatus);
    } catch (error) {
      console.error('Failed to fetch pendaftaran:', error);
      alert('Gagal memuat data pendaftaran');
      navigate('/kaprodi/pendaftaran-ta');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchPendaftaran();
  }, [fetchPendaftaran]);

  const handleCheckboxChange = (berkasId, checked) => {
    setBerkasStatus(prev => ({
      ...prev,
      [berkasId]: {
        ...prev[berkasId],
        is_valid: checked
      }
    }));
  };

  const handleCatatanChange = (berkasId, catatan) => {
    setBerkasStatus(prev => ({
      ...prev,
      [berkasId]: {
        ...prev[berkasId],
        catatan: catatan
      }
    }));
  };

  const handlePreview = (berkasId, fileName) => {
    // Use protected API endpoint (rely pada Authorization header dari fetch)
    const url = `http://localhost:8000/api/berkas-pendaftaran/${berkasId}`;
    
    setPreviewModal({
      isOpen: true,
      fileUrl: url,
      fileName: fileName
    });
  };

  // Check button logic
  const allValid = Object.values(berkasStatus).every(b => b.is_valid);

  const handleSubmit = async (status) => {
    const newErrors = {};

    Object.entries(berkasStatus).forEach(([berkasId, data]) => {
      if (!data.is_valid && (!data.catatan || data.catatan.trim() === '')) {
        newErrors[berkasId] = 'Catatan wajib diisi jika berkas tidak valid';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    const berkasArray = Object.entries(berkasStatus).map(([id, data]) => ({
      id: parseInt(id),
      is_valid: data.is_valid,
      catatan: data.catatan
    }));

    try {
      await api.post(`/kaprodi/pendaftaran-ta/${id}/validasi`, {
        status: status,
        berkas: berkasArray
      });

      alert(`Pendaftaran berhasil ${status === 'valid' ? 'disetujui' : 'ditolak'}`);
      navigate('/kaprodi/pendaftaran-ta');
    } catch (error) {
      console.error('Failed to submit validasi:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan validasi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!pendaftaran) {
    return <div className="p-8">Data tidak ditemukan</div>;
  }

  const isReadOnly = pendaftaran.status_validasi !== 'menunggu';

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Data Pendaftaran Tugas Akhir Mahasiswa
      </h1>

      <div className="bg-white border border-gray-300 p-6">
        {/* Header Info Mahasiswa */}
        <div className="border-b border-gray-300 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-lg">{pendaftaran.mahasiswa?.nama}</h2>
              <p className="text-sm text-gray-600">{pendaftaran.mahasiswa?.nim}</p>
            </div>
          </div>
        </div>

        {/* Tabel Berkas */}
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Nama Dokumen</th>
              <th className="px-4 py-3 text-center text-sm font-semibold w-24">Berkas</th>
              <th className="px-4 py-3 text-center text-sm font-semibold w-32">Berkas Valid?</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Catatan Kaprodi</th>
            </tr>
          </thead>
          <tbody>
            {pendaftaran.berkas_pendaftaran?.map((berkas) => (
              <tr key={berkas.id} className="border-b border-gray-200">
                <td className="px-4 py-3">
                  {berkas.jenis_berkas.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handlePreview(berkas.id, berkas.jenis_berkas)}
                    className="text-blue-600 hover:underline"
                  >
                    ðŸ‘ Lihat
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={berkasStatus[berkas.id]?.is_valid || false}
                    onChange={(e) => handleCheckboxChange(berkas.id, e.target.checked)}
                    className="w-4 h-4"
                    disabled={isReadOnly}
                  />
                </td>
                <td className="px-4 py-3">
                  <textarea
                    value={berkasStatus[berkas.id]?.catatan || ''}
                    onChange={(e) => handleCatatanChange(berkas.id, e.target.value)}
                    placeholder="Tambah Catatan"
                    className={`w-full px-3 py-2 border ${
                      errors[berkas.id] ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                    rows="2"
                    disabled={isReadOnly}
                  />

                  {errors[berkas.id] && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors[berkas.id]}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Buttons */}
        {!isReadOnly && (
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-300">
            <button
              onClick={() => navigate('/kaprodi/pendaftaran-ta')}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
              disabled={submitting}
            >
              Batal
            </button>
            <button
              onClick={() => handleSubmit('tidak_valid')}
              className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400"
              disabled={allValid || submitting}
            >
              {submitting ? 'Menyimpan...' : 'Tolak'}
            </button>
            <button
              onClick={() => handleSubmit('valid')}
              className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
              disabled={!allValid || submitting}
            >
              {submitting ? 'Menyimpan...' : 'Setujui'}
            </button>
          </div>
        )}

        {isReadOnly && (
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-300">
            <button
              onClick={() => navigate('/kaprodi/pendaftaran-ta')}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
            >
              Kembali
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <FilePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', fileName: '' })}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
      />
    </div>
  );
}
