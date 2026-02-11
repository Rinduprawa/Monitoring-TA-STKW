// src/pages/mahasiswa/DetailPengajuanProposal.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import FilePreviewModal from '../../components/modal/FilePreview';

export default function DetailPengajuanProposal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pengajuan, setPengajuan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });

  const fetchPengajuan = useCallback(async () => {
    try {
      const response = await api.get(`/pengajuan-proposal/${id}`);
      setPengajuan(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pengajuan:', error);
      alert('Gagal memuat data pengajuan');
      navigate('/mahasiswa/pengajuan-proposal');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchPengajuan();
  }, [fetchPengajuan]);

  const handlePreview = () => {
    const url = `http://localhost:8000/api/pengajuan-proposal/${id}/preview`;
    setPreviewModal({
      isOpen: true,
      fileUrl: url,
      fileName: 'File Proposal'
    });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!pengajuan) {
    return <div className="p-8">Data tidak ditemukan</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Detail Pengajuan Proposal</h1>
        <button
          onClick={() => navigate('/mahasiswa/pengajuan-proposal')}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
        >
          Kembali
        </button>
      </div>

      <div className="bg-white border border-gray-300 p-6 max-w-3xl space-y-4">
        {/* Judul TA */}
        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/3 font-medium text-gray-700">Judul TA</div>
          <div className="w-2/3">{pengajuan.judul_ta}</div>
        </div>

        {/* Bentuk TA */}
        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/3 font-medium text-gray-700">Bentuk TA</div>
          <div className="w-2/3 capitalize">{pengajuan.bentuk_ta}</div>
        </div>

        {/* Tanggal Pengajuan */}
        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/3 font-medium text-gray-700">Tanggal Pengajuan</div>
          <div className="w-2/3">
            {new Date(pengajuan.tanggal_pengajuan).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>

        {/* Status */}
        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/3 font-medium text-gray-700">Status</div>
          <div className="w-2/3">
            <span className={`px-2 py-1 text-sm border ${
              pengajuan.status === 'diproses' 
                ? 'border-yellow-600 text-yellow-600 bg-yellow-50'
                : pengajuan.status === 'disetujui'
                ? 'border-green-600 text-green-600 bg-green-50'
                : 'border-red-600 text-red-600 bg-red-50'
            }`}>
              {pengajuan.status === 'diproses' ? 'Sedang Diproses' : pengajuan.status === 'disetujui' ? 'Disetujui' : 'Ditolak'}
            </span>
          </div>
        </div>

        {/* Catatan Kaprodi */}
        {pengajuan.catatan_kaprodi && (
          <div className="flex border-b border-gray-200 pb-3">
            <div className="w-1/3 font-medium text-gray-700">Catatan Kaprodi</div>
            <div className="w-2/3">{pengajuan.catatan_kaprodi}</div>
          </div>
        )}

        {/* File Proposal */}
        <div className="flex pb-3">
          <div className="w-1/3 font-medium text-gray-700">File Proposal</div>
          <div className="w-2/3">
            <button
              onClick={handlePreview}
              className="text-blue-600 hover:underline"
            >
              👁 Preview File
            </button>
          </div>
        </div>
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
