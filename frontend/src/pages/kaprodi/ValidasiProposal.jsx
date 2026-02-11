// src/pages/kaprodi/ValidasiProposal.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

export default function ValidasiProposal() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [pengajuan, setPengajuan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(null);

  const fetchPengajuan = useCallback(async () => {
    try {
      const response = await api.get(`/kaprodi/pengajuan-proposal/${id}`);
      setPengajuan(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pengajuan:', error);
      alert('Gagal memuat data pengajuan');
      navigate('/kaprodi/pengajuan-proposal');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchPengajuan();
  }, [fetchPengajuan]);

  // Auto-load preview
  useEffect(() => {
    let controller = new AbortController();
    let createdUrl = null;

    const loadPreview = async () => {
      if (!pengajuan || !pengajuan.id) return;
      
      setPreviewLoading(true);
      setPreviewError(null);
      
      try {
        const response = await api.get(`/pengajuan-proposal/${pengajuan.id}/preview`, {
          responseType: 'blob',
          signal: controller.signal
        });
        
        createdUrl = URL.createObjectURL(response.data);
        setPreviewUrl(createdUrl);
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Failed to load preview:', error.response?.status, error.response?.data, error.message);
          setPreviewError('Gagal memuat preview file');
        }
      } finally {
        setPreviewLoading(false);
      }
    };

    loadPreview();

    return () => {
      controller.abort();
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pengajuan?.id]);

  const handleSubmit = async (status) => {
    setSubmitting(true);

    try {
      await api.post(`/kaprodi/pengajuan-proposal/${id}/validasi`, {
        status: status,
        catatan_kaprodi: null // Opsional, bisa ditambah field catatan jika mau
      });

      alert(`Proposal berhasil ${status === 'disetujui' ? 'disetujui' : 'ditolak'}`);
      navigate('/kaprodi/pengajuan-proposal');
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

  if (!pengajuan) {
    return <div className="p-8">Data tidak ditemukan</div>;
  }

  const isReadOnly = pengajuan.status !== 'diproses';

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Data Pengajuan Proposal Mahasiswa
      </h1>

      <div className="bg-white border border-gray-300 p-6 max-w-3xl">
        {/* Header Mahasiswa */}
        <div className="border-b border-gray-300 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-lg">{pengajuan.mahasiswa?.nama}</h2>
              <p className="text-sm text-gray-600">{pengajuan.mahasiswa?.nim}</p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Judul TA */}
          <div>
            <label className="block mb-2 text-sm font-medium">Judul Tugas Akhir</label>
            <input
              type="text"
              value={pengajuan.judul_ta}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 bg-gray-50"
            />
          </div>

          {/* Bentuk TA */}
          <div>
            <label className="block mb-2 text-sm font-medium">Bentuk Tugas Akhir</label>
            <input
              type="text"
              value={pengajuan.bentuk_ta}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 bg-gray-50 capitalize"
            />
          </div>

          {/* Proposal File */}
          <div>
            <label className="block mb-2 text-sm font-medium">Proposal Tugas Akhir</label>
            
            {previewLoading && (
              <div className="w-full h-96 border border-gray-300 rounded bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            )}
            
            {previewError && (
              <div className="w-full h-96 border border-red-300 rounded bg-red-50 flex items-center justify-center text-red-600">
                {previewError}
              </div>
            )}
            
            {!previewLoading && !previewError && previewUrl && (
              <div className="w-full h-96 border border-gray-300 rounded bg-white">
                <iframe 
                  src={previewUrl} 
                  className="w-full h-full border-0 rounded" 
                  title="Preview Proposal"
                />
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        {!isReadOnly && (
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-300">
            <button
              onClick={() => navigate('/kaprodi/pengajuan-proposal')}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
              disabled={submitting}
            >
              Batal
            </button>
            <button
              onClick={() => handleSubmit('ditolak')}
              className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400"
              disabled={submitting}
            >
              {submitting ? 'Menyimpan...' : 'Tolak'}
            </button>
            <button
              onClick={() => handleSubmit('disetujui')}
              className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
              disabled={submitting}
            >
              {submitting ? 'Menyimpan...' : 'Setujui'}
            </button>
          </div>
        )}

        {isReadOnly && (
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-300">
            <button
              onClick={() => navigate('/kaprodi/pengajuan-proposal')}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
            >
              Kembali
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
