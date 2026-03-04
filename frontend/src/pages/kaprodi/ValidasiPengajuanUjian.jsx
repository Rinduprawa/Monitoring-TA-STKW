// src/pages/kaprodi/ValidasiUjian.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

export default function ValidasiUjian() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [catatan, setCatatan] = useState('');

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

  const handleSubmit = async (status) => {
    if (status === 'ditolak_kaprodi' && !catatan.trim()) {
      alert('Catatan wajib diisi jika menolak.');
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/kaprodi/pengajuan-ujian/${id}/validasi`, {
        status,
        catatan_kaprodi: status === 'ditolak_kaprodi' ? catatan : null
      });

      alert('Validasi berhasil');
      navigate('/kaprodi/pengajuan-ujian');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memvalidasi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">Data tidak ditemukan</div>;

  const { pengajuan, proposal } = data;
  const isReadOnly = pengajuan.status !== 'disetujui_pembimbing';

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Validasi Pengajuan Ujian
      </h1>

      <div className="bg-white border border-gray-300 p-6 max-w-3xl space-y-6">

        <div>
          <label className="block mb-2 text-sm font-medium">Nama Mahasiswa</label>
          <input
            value={`${pengajuan.mahasiswa?.nama} (${pengajuan.mahasiswa?.nim})`}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 bg-gray-50"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Judul TA</label>
          <input
            value={proposal?.judul_ta || '-'}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 bg-gray-50"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Bentuk TA</label>
          <input
            value={proposal?.bentuk_ta || '-'}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 bg-gray-50 capitalize"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Jenis Ujian</label>
          <input
            value={pengajuan.jenis_ujian}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 bg-gray-50"
          />
        </div>

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

        {!isReadOnly && (
          <div>
            <label className="block mb-2 text-sm font-medium">
              Catatan Kaprodi (Wajib jika menolak)
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full p-2 border border-gray-300"
              rows="3"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-300">
          <button
            onClick={() => navigate('/kaprodi/pengajuan-ujian')}
            className="px-4 py-2 border border-gray-300"
            disabled={submitting}
          >
            Kembali
          </button>

          {!isReadOnly && (
            <>
              <button
                onClick={() => handleSubmit('ditolak_kaprodi')}
                className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400"
                disabled={submitting}
              >
                Tolak
              </button>
              <button
                onClick={() => handleSubmit('disetujui_kaprodi')}
                className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
                disabled={submitting}
              >
                Setujui
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}