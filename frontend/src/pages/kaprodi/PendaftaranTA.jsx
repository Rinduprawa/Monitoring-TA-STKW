// src/pages/kaprodi/PendaftaranTA.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TitleWithInfo from '../../components/common/TitleWithInfo';

export default function PendaftaranTAKaprodi() {
  const navigate = useNavigate();
  const [pendaftarans, setPendaftarans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const tooltipItems = [
    'Surat Permohonan',
    'Bukti Uang Gedung Lunas',
    'Kuitansi SPP',
    'Kuitansi Biaya TA',
    'KHS Semester Lalu',
    'KRS Semester Ini',
    'Transkrip Nilai',
    'Dokumen Proyeksi TA',
  ];
  useEffect(() => {
    fetchPendaftarans();
  }, []);

  const fetchPendaftarans = async () => {
    try {
      const response = await api.get('/kaprodi/pendaftaran-ta');
      setPendaftarans(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pendaftaran:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'menunggu': 'border-yellow-600 text-yellow-600 bg-yellow-50',
      'valid': 'border-green-600 text-green-600 bg-green-50',
      'tidak_valid': 'border-red-600 text-red-600 bg-red-50',
    };
    const labels = {
      'menunggu': 'Menunggu Validasi',
      'valid': 'Disetujui',
      'tidak_valid': 'Ditolak',
    };
    return <span className={`px-2 py-1 text-xs border ${styles[status]}`}>{labels[status]}</span>;
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Data Pendaftaran Tugas Akhir Mahasiswa</h1>
        <TitleWithInfo
          title="Lihat Persyaratan"
          tooltipTitle="Persyaratan Pendaftaran Tugas Akhir:"
          tooltipItems={tooltipItems}
        />

      <div className="bg-white border border-gray-300">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Nama Mahasiswa</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal Pendaftaran</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pendaftarans.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  Belum ada pendaftaran
                </td>
              </tr>
            ) : (
              pendaftarans.map((pendaftaran, index) => (
                <tr key={pendaftaran.id} className="border-b border-gray-200">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{pendaftaran.mahasiswa?.nama}</div>
                      <div className="text-sm text-gray-500">{pendaftaran.mahasiswa?.nim}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(pendaftaran.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(pendaftaran.status_validasi)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {pendaftaran.status_validasi === 'menunggu' ? (
                        <button
                          onClick={() => navigate(`/kaprodi/pendaftaran-ta/validasi/${pendaftaran.id}`)}
                          className="px-3 py-1 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm"
                        >
                          ✏️ Validasi
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/kaprodi/pendaftaran-ta/validasi/${pendaftaran.id}`)}
                          className="px-3 py-1 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                        >
                          👁 Lihat Detail
                        </button>
                      )}
                    </div>
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
