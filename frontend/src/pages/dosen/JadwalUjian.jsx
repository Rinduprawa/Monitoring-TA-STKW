// src/pages/dosen/JadwalUjian.jsx

import { useState, useEffect } from 'react';
import api from '../../services/api';
import TabelJadwal from '../../components/table/TabelJadwalDosen';

export default function JadwalUjian() {
  const [activeTab, setActiveTab] = useState('proposal');
  const [jadwals, setJadwals] = useState([]);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { key: 'proposal', label: 'Proposal', hasJenisColumn: false },
    { key: 'tahap_1', label: 'Kelayakan / Tahap 1', hasJenisColumn: true },
    { key: 'tahap_2', label: 'Kelayakan / Tahap 2', hasJenisColumn: true },
    { key: 'pergelaran', label: 'Pergelaran', hasJenisColumn: false },
    { key: 'sidang_akhir', label: 'Sidang Akhir', hasJenisColumn: true },
  ];

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
      const response = await api.get('/dosen/jadwal-ujian', {
        params: { jenis_ujian: jenisUjianList.join(',') }
      });
      setJadwals(response.data.data);
    } catch (error) {
      console.error('Failed to fetch jadwal:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentTab = tabs.find(t => t.key === activeTab);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Jadwal Ujian Tugas Akhir</h1>

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
        showJenisColumn={currentTab?.hasJenisColumn}
      />
    </div>
  );
}