// src/pages/kaprodi/PengajuanUjian.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function PengajuanUjian() {
  const navigate = useNavigate();
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('kelayakan_tahap_1');

  const tabs = [
    { key: 'kelayakan_tahap_1', label: 'Kelayakan / Tahap 1', jenis: ['uji_kelayakan_1','tes_tahap_1'] },
    { key: 'kelayakan_tahap_2', label: 'Kelayakan / Tahap 2', jenis: ['uji_kelayakan_2','tes_tahap_2'] },
    { key: 'pergelaran', label: 'Pergelaran', jenis: ['pergelaran'] },
    { key: 'sidang_akhir', label: 'Sidang Akhir', jenis: ['sidang_skripsi','sidang_komprehensif'] }
  ];

const currentTab = tabs.find(t => t.key === activeTab);

const filteredPengajuan = pengajuan.filter(item =>
  currentTab.jenis.includes(item.jenis_ujian)
  );
  
  useEffect(() => {
    fetchPengajuan();
  }, []);

  const fetchPengajuan = async () => {
    setLoading(true);
    try {
      const response = await api.get('/kaprodi/pengajuan-ujian');
      setPengajuan(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pengajuan:', error);
    } finally {
      setLoading(false);
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
      'disetujui_pembimbing': 'Menunggu Validasi',
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

  const handleAction = (item) => {
    if (item.status === 'disetujui_pembimbing') {
      navigate(`/kaprodi/pengajuan-ujian/validasi/${item.id}`);
    } else {
      navigate(`/kaprodi/pengajuan-ujian/${item.id}`);
    }
  };

  const isValidateDisabled = (status) => {
    return status === 'diproses_pembimbing';
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Data Pengajuan Mengikuti Ujian TA Mahasiswa
      </h1>

      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 border border-gray-800 ${
              activeTab === tab.key
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : pengajuan.length === 0 ? (
        <div className="border border-gray-300 bg-white p-8 text-center text-gray-500">
          Belum ada pengajuan
        </div>
      ) : (
        <div className="border border-gray-800 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="p-3 text-left border-r border-gray-300">No</th>
                <th className="p-3 text-left border-r border-gray-300">Nama Mahasiswa</th>
                <th className="p-3 text-left border-r border-gray-300">Bentuk TA</th>
                <th className="p-3 text-left border-r border-gray-300">Jenis Ujian</th>
                <th className="p-3 text-left border-r border-gray-300">Tanggal Pengajuan</th>
                <th className="p-3 text-left border-r border-gray-300">Status</th>
                <th className="p-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPengajuan.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="p-3 border-r border-gray-300">{index + 1}</td>
                  <td className="p-3 border-r border-gray-300">
                    <p className="font-medium">{item.mahasiswa?.nama}</p>
                    <p className="text-xs text-gray-500">{item.mahasiswa?.nim}</p>
                  </td>
                  <td className="p-3 border-r border-gray-300 capitalize">
                    {item.mahasiswa?.bentuk_ta}
                  </td>
                  <td className="p-3 border-r border-gray-300">
                    {getJenisUjianLabel(item.jenis_ujian)}
                  </td>
                  <td className="p-3 border-r border-gray-300">
                    {new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID', {
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
                    {item.status === 'disetujui_pembimbing' ? (
                      <button
                        onClick={() => handleAction(item)}
                        className="px-4 py-1 bg-blue-600 text-white text-sm hover:bg-blue-700"
                      >
                        Validasi
                      </button>
                    ) : item.status === 'diproses_pembimbing' ? (
                      <button
                        disabled
                        className="px-4 py-1 bg-gray-300 text-gray-600 text-sm cursor-not-allowed"
                      >
                        Validasi
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(item)}
                        className="px-4 py-1 border border-gray-800 text-sm"
                      >
                        Lihat Detail
                      </button>
                    )}
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