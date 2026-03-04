// src/pages/kaprodi/DetailPengajuanUjian.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

export default function DetailPengajuanUjian() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get(`/kaprodi/pengajuan-ujian/${id}`);
      setData(response.data.data);
    } catch (error) {
      alert('Gagal memuat data');
      navigate('/kaprodi/pengajuan-ujian');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let controller = new AbortController();
    let createdUrl = null;

    const loadPreview = async () => {
      try {
        const response = await api.get(`/kaprodi/pengajuan-ujian/${id}/preview-bukti`, {
          responseType: 'blob',
          signal: controller.signal
        });

        createdUrl = URL.createObjectURL(response.data);
        setPreviewUrl(createdUrl);
      } catch {
        setPreviewUrl(null);
      }
    };

    loadPreview();

    return () => {
      controller.abort();
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [id]);

  const getStatusLabel = (status) => {
    const labels = {
      'diproses_pembimbing': 'Diproses Pembimbing',
      'ditolak_pembimbing': 'Ditolak Pembimbing',
      'disetujui_pembimbing': 'Menunggu Validasi Kaprodi',
      'ditolak_kaprodi': 'Ditolak Kaprodi',
      'disetujui_kaprodi': 'Disetujui Kaprodi',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'diproses_pembimbing': 'bg-yellow-50 border-yellow-600 text-yellow-600',
      'ditolak_pembimbing': 'bg-red-50 border-red-600 text-red-600',
      'disetujui_pembimbing': 'bg-blue-50 border-blue-600 text-blue-600',
      'ditolak_kaprodi': 'bg-red-50 border-red-600 text-red-600',
      'disetujui_kaprodi': 'bg-green-50 border-green-600 text-green-600',
    };
    return colors[status] || 'bg-gray-50 border-gray-600 text-gray-600';
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">Data tidak ditemukan</div>;

  const { pengajuan, proposal } = data;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Detail Pengajuan Ujian
      </h1>

      <div className="bg-white border border-gray-300 p-6 max-w-3xl space-y-6">

        {/* Mahasiswa */}
        <div>
          <label className="block mb-2 text-sm font-medium">Mahasiswa</label>
          <input
            value={`${pengajuan.mahasiswa?.nama} (${pengajuan.mahasiswa?.nim})`}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 bg-gray-50"
          />
        </div>

        {/* Judul TA */}
        <div>
          <label className="block mb-2 text-sm font-medium">Judul TA</label>
          <input
            value={proposal?.judul_ta || '-'}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 bg-gray-50"
          />
        </div>

        {/* Bentuk TA */}
        <div>
          <label className="block mb-2 text-sm font-medium">Bentuk TA</label>
          <input
            value={proposal?.bentuk_ta || '-'}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 bg-gray-50 capitalize"
          />
        </div>

        {/* Jenis Ujian */}
        <div>
          <label className="block mb-2 text-sm font-medium">Jenis Ujian</label>
          <input
            value={pengajuan.jenis_ujian}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 bg-gray-50"
          />
        </div>

        {/* Tanggal Pengajuan */}
        <div>
          <label className="block mb-2 text-sm font-medium">Tanggal Pengajuan</label>
          <input
            value={new Date(pengajuan.tanggal_pengajuan).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 bg-gray-50"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block mb-2 text-sm font-medium">Status</label>
          <span className={`px-3 py-1 text-sm border ${getStatusColor(pengajuan.status)}`}>
            {getStatusLabel(pengajuan.status)}
          </span>
        </div>

        {/* Bukti Kelayakan */}
        <div>
          <label className="block mb-2 text-sm font-medium">Bukti Kelayakan</label>
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-96 border border-gray-300"
              title="Preview Bukti"
            />
          ) : (
            <div className="w-full h-96 border border-gray-300 flex items-center justify-center text-gray-500">
              Tidak dapat memuat preview
            </div>
          )}
        </div>

        {/* Catatan Kaprodi */}
        {pengajuan.catatan_kaprodi && (
          <div>
            <label className="block mb-2 text-sm font-medium">Catatan Kaprodi</label>
            <div className="w-full px-3 py-2 border border-gray-300 bg-gray-50">
              {pengajuan.catatan_kaprodi}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-300">
          <button
            onClick={() => navigate('/kaprodi/pengajuan-ujian')}
            className="px-4 py-2 border border-gray-300"
          >
            Kembali
          </button>
        </div>

      </div>
    </div>
  );
}