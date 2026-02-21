// src/pages/kaprodi/ManajemenJadwal.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TabelJadwal from '../../components/table/TabelJadwal';

export default function ManajemenJadwal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('proposal');
  const [jadwals, setJadwals] = useState([]);
  const [loading, setLoading] = useState(false);

  const jenisUjian = [
    { key: 'proposal', label: 'Proposal' },
    { key: 'uji_kelayakan_1', label: 'Kelayakan / Tahap 1' },
    { key: 'uji_kelayakan_2', label: 'Kelayakan / Tahap 2' },
    { key: 'pergelaran', label: 'Pergelaran' },
    { key: 'sidang_akhir', label: 'Sidang Akhir' },
  ];

  useEffect(() => {
    fetchJadwals();
  }, [activeTab]);

  const fetchJadwals = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/kaprodi/jadwal-ujian?jenis_ujian=${activeTab}`);
      setJadwals(response.data.data);
    } catch (error) {
      console.error('Failed to fetch jadwal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus jadwal ini?')) {
      try {
        await api.delete(`/kaprodi/jadwal-ujian/${id}`);
        fetchJadwals();
      } catch (error) {
        alert(error.response?.data?.message || 'Gagal menghapus jadwal');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manajemen Jadwal Ujian</h1>
        <button
          onClick={() => navigate('/kaprodi/jadwal-ujian/create')}
          className="px-4 py-2 border border-gray-800"
        >
          + Tambah Jadwal
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {jenisUjian.map((jenis) => (
          <button
            key={jenis.key}
            onClick={() => setActiveTab(jenis.key)}
            className={`px-6 py-2 border border-gray-800 ${
              activeTab === jenis.key ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}
          >
            {jenis.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <TabelJadwal
        jadwals={jadwals}
        loading={loading}
        onEdit={(id) => navigate(`/kaprodi/jadwal-ujian/edit/${id}`)}
        onDelete={handleDelete}
        onRefresh={fetchJadwals}
      />
    </div>
  );
}