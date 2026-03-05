// src/pages/dosen/Bimbingan.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Bimbingan() {
  const navigate = useNavigate();
  const [mahasiswas, setMahasiswas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMahasiswas();
  }, []);

  const fetchMahasiswas = async () => {
    try {
      const response = await api.get('/dosen/bimbingan');
      setMahasiswas(response.data.data);
    } catch (error) {
      console.error('Failed to fetch mahasiswa:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Manajemen Catatan Bimbingan</h1>

      <div className="border border-gray-800 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="p-3 text-left border-r border-gray-300 w-12">No</th>
              <th className="p-3 text-left border-r border-gray-300">Nama Mahasiswa</th>
              <th className="p-3 text-left border-r border-gray-300">Judul TA</th>
              <th className="p-3 text-left border-r border-gray-300">Bentuk TA</th>
              <th className="p-3 text-left border-r border-gray-300">Sebagai</th>
              <th className="p-3 text-left border-r border-gray-300">Bimbingan Terakhir</th>
              <th className="p-3 text-left border-r border-gray-300 relative">
                <div className="flex items-center gap-1">
                  Jumlah Bimbingan
                  <div className="group relative">
                    <span className="cursor-help text-gray-500">ⓘ</span>
                    <div className="absolute left-0 top-6 bg-gray-800 text-white text-xs p-2 rounded shadow-lg w-48 z-10 hidden group-hover:block">
                      Jumlah bimbingan yang sudah dilakukan terhadap jumlah minimal untuk tahap saat ini
                    </div>
                  </div>
                </div>
              </th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {mahasiswas.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-500">
                  Belum ada mahasiswa bimbingan
                </td>
              </tr>
            ) : (
              mahasiswas.map((mhs, index) => (
                <tr key={mhs.mahasiswa_id} className="border-b border-gray-200">
                  <td className="p-3 border-r border-gray-300">{index + 1}</td>
                  <td className="p-3 border-r border-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{mhs.nama}</p>
                        <p className="text-xs text-gray-500">{mhs.nim}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 border-r border-gray-300 text-sm max-w-xs truncate">
                    {mhs.judul_ta}
                  </td>
                  <td className="p-3 border-r border-gray-300 text-sm capitalize">
                    {mhs.bentuk_ta}
                  </td>
                  <td className="p-3 border-r border-gray-300 text-sm">
                    {mhs.sebagai}
                  </td>
                  <td className="p-3 border-r border-gray-300 text-sm">
                    {mhs.bimbingan_terakhir 
                      ? new Date(mhs.bimbingan_terakhir).toLocaleDateString('id-ID')
                      : '-'
                    }
                  </td>
                  <td className="p-3 border-r border-gray-300 text-sm text-center">
                    {mhs.jumlah_bimbingan} / {mhs.minimal_bimbingan}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => navigate(`/dosen/bimbingan/${mhs.mahasiswa_id}`)}
                      className="px-3 py-1 border border-gray-300 hover:bg-gray-50 text-sm"
                    >
                      👁 Lihat Detail
                    </button>
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
