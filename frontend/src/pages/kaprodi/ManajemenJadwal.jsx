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

  // Define tabs (no jenis uji column distinction yet)
  const tabs = [
    { key: 'proposal', label: 'Proposal', hasJenisColumn: false },
    { key: 'tahap_1', label: 'Kelayakan / Tahap 1', hasJenisColumn: true }, // ← Dynamic
    { key: 'tahap_2', label: 'Kelayakan / Tahap 2', hasJenisColumn: true }, // ← Dynamic
    { key: 'pergelaran', label: 'Pergelaran', hasJenisColumn: false },
    { key: 'sidang_akhir', label: 'Sidang Akhir', hasJenisColumn: true }, // ← Dynamic
  ];

  // Map tab to actual jenis_ujian values
  const getJenisUjianForTab = (tabKey) => {
    const mapping = {
      'proposal': ['proposal'],
      'tahap_1': ['uji_kelayakan_1', 'tes_tahap_1'],
      'tahap_2': ['uji_kelayakan_2', 'tes_tahap_2'],
      'pergelaran': ['pergelaran'],
      'sidang_akhir': ['sidang_skripsi', 'sidang_komprehensif'],
    };
    return mapping[tabKey] || [];
  };

  useEffect(() => {
    fetchJadwals();
  }, [activeTab]);

  const fetchJadwals = async () => {
    setLoading(true);
    try {
      const jenisUjianList = getJenisUjianForTab(activeTab);
      const response = await api.get('/kaprodi/jadwal-ujian', {
        params: { jenis_ujian: jenisUjianList.join(',') } // Send multiple
      });
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

  const currentTab = tabs.find(t => t.key === activeTab);

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
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 border border-gray-800 ${
              activeTab === tab.key ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <TabelJadwal
        jadwals={jadwals}
        loading={loading}
        showJenisColumn={currentTab?.hasJenisColumn} // ← Pass flag
        onEdit={(id) => navigate(`/kaprodi/jadwal-ujian/edit/${id}`)}
        onDelete={handleDelete}
        onRefresh={fetchJadwals}
      />
    </div>
  );
}