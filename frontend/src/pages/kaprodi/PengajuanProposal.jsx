// src/pages/kaprodi/PengajuanProposal.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function PengajuanProposal() {
  const navigate = useNavigate();
  const [pengajuans, setPengajuans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPengajuans();
  }, []);

  const fetchPengajuans = async () => {
    try {
      const response = await api.get('/kaprodi/pengajuan-proposal');
      setPengajuans(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pengajuan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'diproses': 'border-yellow-600 text-yellow-600 bg-yellow-50',
      'disetujui': 'border-green-600 text-green-600 bg-green-50',
      'ditolak': 'border-red-600 text-red-600 bg-red-50',
    };
    const labels = {
      'diproses': 'Menunggu Validasi',
      'disetujui': 'Disetujui',
      'ditolak': 'Ditolak',
    };
    return <span className={`px-2 py-1 text-xs border ${styles[status]}`}>{labels[status]}</span>;
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Data Pengajuan Proposal Mahasiswa</h1>

      <p className="text-sm text-gray-600 mb-4">
        <span className="inline-flex items-center gap-1">
          ℹ️ Lihat Persyaratan
        </span>
      </p>

      <div className="bg-white border border-gray-300">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Nama Mahasiswa</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Judul TA</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal Pengajuan</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pengajuans.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  Belum ada pengajuan
                </td>
              </tr>
            ) : (
              pengajuans.map((pengajuan, index) => (
                <tr key={pengajuan.id} className="border-b border-gray-200">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gray-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">{pengajuan.mahasiswa?.nama}</div>
                        <div className="text-sm text-gray-500">{pengajuan.mahasiswa?.nim}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{pengajuan.judul_ta}</td>
                  <td className="px-4 py-3">
                    {new Date(pengajuan.tanggal_pengajuan).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(pengajuan.status)}</td>
                  <td className="px-4 py-3">
                    {pengajuan.status === 'diproses' ? (
                      <button
                        onClick={() => navigate(`/kaprodi/pengajuan-proposal/validasi/${pengajuan.id}`)}
                        className="px-3 py-1 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm"
                      >
                        ✏️ Validasi
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/kaprodi/pengajuan-proposal/validasi/${pengajuan.id}`)}
                        className="px-3 py-1 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                      >
                        👁 Lihat Detail
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
