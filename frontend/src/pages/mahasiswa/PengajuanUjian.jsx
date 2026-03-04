// src/pages/mahasiswa/PengajuanUjian.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function PengajuanUjian() {
  const navigate = useNavigate();
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [canSubmitMessage, setCanSubmitMessage] = useState(null);


  useEffect(() => {
    fetchData();
    checkCanSubmit();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pengajuan-ujian');
      setPengajuan(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pengajuan:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCanSubmit = async () => {
    try {
      const response = await api.get('/pengajuan-ujian/can-submit');
      if (!response.data.eligible) {
        setCanSubmit(false);
        setCanSubmitMessage(response.data.message);
      }
    } catch (error) {
      console.error('Failed to check can submit:', error);
    }
  };

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
      'disetujui_pembimbing': 'Diproses Kaprodi',
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

  const canEdit = (status) => {
    return status === 'diproses_pembimbing';
  };

  const handleView = (id, status) => {
    if (canEdit(status)) {
      navigate(`/mahasiswa/pengajuan-ujian/edit/${id}`);
    } else {
      navigate(`/mahasiswa/pengajuan-ujian/${id}`);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Pengajuan Ujian</h1>
        <button
          onClick={() => navigate('/mahasiswa/pengajuan-ujian/tambah')}
          disabled={!canSubmit}
          className={`px-4 py-2 border border-gray-800 ${
            canSubmit
              ? 'bg-white text-gray-800 hover:bg-gray-100'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          + Tambah Pengajuan
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : pengajuan.length === 0 ? (
        <div>
          {!canSubmit ? (
            <div className="bg-white border border-red-300 p-8 text-center text-red-600">
              {canSubmitMessage}
            </div>
          ) : (
            <div className="bg-white border border-gray-300 p-8 text-center text-gray-500">
              Belum ada pengajuan. Klik tombol "Tambah Pengajuan" untuk membuat pengajuan baru.
            </div>
          )}
        </div>
      ) : (
        <div className="border border-gray-800 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="p-3 text-left border-r border-gray-300">No</th>
                <th className="p-3 text-left border-r border-gray-300">Nama Ujian</th>
                <th className="p-3 text-left border-r border-gray-300">Tanggal Pengajuan</th>
                <th className="p-3 text-left border-r border-gray-300">Status</th>
                <th className="p-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pengajuan.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="p-3 border-r border-gray-300">{index + 1}</td>
                  <td className="p-3 border-r border-gray-300">
                    {getJenisUjianLabel(item.jenis_ujian)}
                  </td>
                  <td className="p-3 border-r border-gray-300">
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="p-3 border-r border-gray-300">
                    <span className={`px-2 py-1 text-xs border ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleView(item.id, item.status)}
                      className="text-lg"
                      title={canEdit(item.status) ? 'Edit' : 'Lihat Detail'}
                    >
                      {canEdit(item.status) ? '✏️' : '👁️'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}