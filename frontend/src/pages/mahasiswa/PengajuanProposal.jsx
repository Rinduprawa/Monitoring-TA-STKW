// src/pages/mahasiswa/PengajuanProposal.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function PengajuanProposal() {
  const navigate = useNavigate();
  const [pengajuans, setPengajuans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(true);

  useEffect(() => {
    fetchPengajuans();
  }, []);

  const fetchPengajuans = async () => {
    try {
      const response = await api.get('/pengajuan-proposal');
      const data = response.data.data;
      setPengajuans(data);

      // Check if ada pengajuan yang sedang diproses
      const hasPending = data.some(p => p.status === 'diproses' || p.status === 'disetujui');
      setCanCreate(!hasPending);
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
      'diproses': 'Sedang Diproses',
      'disetujui': 'Disetujui',
      'ditolak': 'Ditolak',
    };
    return <span className={`px-2 py-1 text-xs border ${styles[status]}`}>{labels[status]}</span>;
  };

  const canEdit = (status) => status === 'diproses';

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Pengajuan Proposal</h1>
          <div className="relative group">
            <button className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 text-xs hover:bg-gray-100">
              i
            </button>
            <div className="absolute left-0 top-6 bg-gray-800 text-white text-xs p-3 rounded shadow-lg w-64 z-10 hidden group-hover:block">
              <p className="font-semibold mb-2">Lihat Persyaratan</p>
              <ul className="list-disc list-inside space-y-1">
                <li>File proposal: PDF, DOC, DOCX (max 5MB)</li>
              </ul>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/mahasiswa/pengajuan-proposal/create')}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!canCreate}
        >
          + Tambah Pengajuan
        </button>
      </div>

      {pengajuans.length === 0 ? (
        <div className="bg-white border border-gray-300 p-8 text-center text-gray-500">
          Belum ada pengajuan. Klik tombol "Tambah Pengajuan" untuk membuat pengajuan baru.
        </div>
      ) : (
        <div className="bg-white border border-gray-300">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Judul TA</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Bentuk TA</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal Pengajuan</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pengajuans.map((pengajuan, index) => (
                <tr key={pengajuan.id} className="border-b border-gray-200">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{pengajuan.judul_ta}</td>
                  <td className="px-4 py-3 capitalize">{pengajuan.bentuk_ta}</td>
                  <td className="px-4 py-3">
                    {new Date(pengajuan.tanggal_pengajuan).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(pengajuan.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {canEdit(pengajuan.status) ? (
                        <>
                          <button
                            onClick={() => navigate(`/mahasiswa/pengajuan-proposal/edit/${pengajuan.id}`)}
                            className="px-3 py-1 border border-gray-300 hover:bg-gray-50 text-sm"
                          >
                            Ubah Data
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => navigate(`/mahasiswa/pengajuan-proposal/${pengajuan.id}`)}
                          className="px-3 py-1 border border-gray-300 hover:bg-gray-50 text-sm"
                        >
                          ðŸ‘ Lihat Detail
                        </button>
                      )}
                    </div>
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
