// src/pages/mahasiswa/DetailPengajuanUjian.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import FilePreviewModal from '../../components/modal/FilePreview';

export default function DetailPengajuanUjian() {
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
      const response = await api.get(`/pengajuan-ujian/${id}`);
      setPengajuan(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pengajuan:', error);
      alert('Gagal memuat data pengajuan');
      navigate('/mahasiswa/pengajuan-ujian');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchPengajuan();
  }, [fetchPengajuan]);

  const getJenisUjianLabel = (jenis) => {
    const labels = {
      'uji_kelayakan_1': 'Kelayakan 1',
      'tes_tahap_1': 'Tahap 1',
      'uji_kelayakan_2': 'Kelayakan 2',
      'tes_tahap_2': 'Tahap 2',
      'pergelaran': 'Pergelaran',
      'sidang_skripsi': 'Sidang Skripsi',
      'sidang_komprehensif': 'Sidang Komprehensif',
    };
    return labels[jenis] || jenis;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'diproses_pembimbing': 'Diproses Pembimbing',
      'ditolak_pembimbing': 'Ditolak Pembimbing',
      'disetujui_pembimbing': 'Disetujui Pembimbing, Sedang Diproses Kaprodi',
      'ditolak_kaprodi': 'Ditolak Kaprodi',
      'disetujui_kaprodi': 'Disetujui Kaprodi',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'diproses_pembimbing': 'bg-blue-50 border-blue-600 text-blue-600',
      'ditolak_pembimbing': 'bg-red-50 border-red-600 text-red-600',
      'disetujui_pembimbing': 'bg-blue-50 border-blue-600 text-blue-600',
      'ditolak_kaprodi': 'bg-red-50 border-red-600 text-red-600',
      'disetujui_kaprodi': 'bg-green-50 border-green-600 text-green-600',
    };
    return colors[status] || 'bg-gray-50 border-gray-600 text-gray-600';
  };

  const handlePreview = () => {
    setPreviewModal({
      isOpen: true,
      fileUrl: `/pengajuan-ujian/${id}/preview-bukti?t=${Date.now()}`,
      fileName: 'Bukti Kelayakan'
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
        <h1 className="text-2xl font-semibold">Detail Pengajuan Ujian</h1>
        <button
          onClick={() => navigate('/mahasiswa/pengajuan-ujian')}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
        >
          Kembali
        </button>
      </div>

      <div className="bg-white border border-gray-300 p-6 max-w-3xl space-y-4">

        {/* Jenis Ujian */}
        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/3 font-medium text-gray-700">Jenis Ujian</div>
          <div className="w-2/3">
            {getJenisUjianLabel(pengajuan.jenis_ujian)}
          </div>
        </div>

        {/* Status */}
        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/3 font-medium text-gray-700">Status</div>
          <div className="w-2/3">
            <span className={`px-2 py-1 text-sm border ${getStatusColor(pengajuan.status)}`}>
              {getStatusLabel(pengajuan.status)}
            </span>
          </div>
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

        {/* Bukti Kelayakan */}
        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/3 font-medium text-gray-700">Bukti Kelayakan</div>
          <div className="w-2/3">
            <button
              onClick={handlePreview}
              className="text-blue-600 hover:underline"
            >
              👁 Preview File
            </button>
          </div>
        </div>

        {/* Catatan Pembimbing */}
        {pengajuan.status === 'ditolak_pembimbing' && pengajuan.catatan_pembimbing && (
          <div className="flex border-b border-gray-200 pb-3">
            <div className="w-1/3 font-medium text-gray-700">Catatan Pembimbing</div>
            <div className="w-2/3">{pengajuan.catatan_pembimbing}</div>
          </div>
        )}

        {/* Catatan Kaprodi */}
        {pengajuan.status === 'ditolak_kaprodi' && pengajuan.catatan_kaprodi && (
          <div className="flex pb-3">
            <div className="w-1/3 font-medium text-gray-700">Catatan Kaprodi</div>
            <div className="w-2/3">{pengajuan.catatan_kaprodi}</div>
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