// src/pages/kaprodi/PenugasanDosen.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TabelPenugasan from '../../components/table/TablePenugasan';

export default function PenugasanDosen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pembimbing');
  const [penugasan, setPenugasan] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPenugasan();
  }, [activeTab]);

  const fetchPenugasan = async () => {
    setLoading(true);
    try {
      const response = await api.get('/kaprodi/penugasan-dosen', {
        params: { kategori: activeTab }
      });
      setPenugasan(response.data.data);
    } catch (error) {
      console.error('Failed to fetch penugasan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus penugasan ini?')) {
      try {
        await api.delete(`/kaprodi/penugasan-dosen/${id}`);
        fetchPenugasan();
      } catch (error) {
        alert(error.response?.data?.message || 'Gagal menghapus penugasan');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Penugasan Dosen</h1>
        <button
          onClick={() => navigate('/kaprodi/penugasan-dosen/create')}
          className="px-4 py-2 border border-gray-800"
        >
          + Tambah Penugasan
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('pembimbing')}
          className={`px-6 py-2 border border-gray-800 ${
            activeTab === 'pembimbing' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}
        >
          Pembimbing
        </button>
        <button
          onClick={() => setActiveTab('penguji')}
          className={`px-6 py-2 border border-gray-800 ${
            activeTab === 'penguji' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}
        >
          Penguji
        </button>
      </div>

      {/* Table */}
      <TabelPenugasan
        penugasan={penugasan}
        kategori={activeTab}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}