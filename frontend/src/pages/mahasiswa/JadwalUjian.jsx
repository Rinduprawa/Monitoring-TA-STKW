// src/pages/mahasiswa/JadwalUjian.jsx

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { getJenisUjianLabel, getJenisPengujiLabel } from '../../utils/jadwalHelpers';

export default function JadwalUjian() {
  const [jadwals, setJadwals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJadwals();
  }, []);

  const fetchJadwals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/jadwal-ujian');
      setJadwals(response.data.data);
    } catch (error) {
      console.error('Failed to fetch jadwal:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHariTanggal = (tanggal, hari = null) => {
    const date = new Date(tanggal);
    const hariName = hari || date.toLocaleDateString('id-ID', { weekday: 'long' });
    const tanggalStr = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return `${hariName}, ${tanggalStr}`;
  };

  const formatJam = (jamMulai, jamSelesai) => {
    return `${jamMulai} - ${jamSelesai}`;
  };

  const getStatusBadge = (status) => {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className={`px-2 py-1 text-xs border ${status.color}`}>
          {status.label}
        </span>
        {status.nilai && (
          <span className="text-xs text-gray-600">Nilai: {status.nilai}</span>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Jadwal Ujian Tugas Akhir</h1>

      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : jadwals.length === 0 ? (
        <div className="border border-gray-300 bg-white p-8 text-center text-gray-500">
          Belum ada jadwal ujian
        </div>
      ) : (
        <div className="border border-gray-800 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="p-3 text-left border-r border-gray-300">No</th>
                <th className="p-3 text-left border-r border-gray-300">Nama Ujian</th>
                <th className="p-3 text-left border-r border-gray-300">Hari/Tanggal</th>
                <th className="p-3 text-left border-r border-gray-300">Jam</th>
                <th className="p-3 text-left border-r border-gray-300">Penguji</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {jadwals.map((jadwal, index) => (
                <tr key={jadwal.id} className="border-b border-gray-300">
                  <td className="p-3 border-r border-gray-300">{index + 1}</td>
                  <td className="p-3 border-r border-gray-300">
                    {getJenisUjianLabel(jadwal.jenis_ujian)}
                  </td>
                  <td className="p-3 border-r border-gray-300">
                    {formatHariTanggal(jadwal.tanggal, jadwal.hari)}
                  </td>
                  <td className="p-3 border-r border-gray-300">
                    {formatJam(jadwal.jam_mulai, jadwal.jam_selesai)}
                  </td>
                  <td className="p-3 border-r border-gray-300">
                    {jadwal.penguji && jadwal.penguji.length > 0 ? (
                      <div className="text-sm space-y-1">
                        {jadwal.penguji.map((p, i) => (
                          <div key={i} className="flex gap-1">
                            <span className="text-xs text-gray-600 font-medium min-w-[80px]">
                              {getJenisPengujiLabel(p.jenis_penugasan)}:
                            </span>
                            <span>{p.nama}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Belum ada</span>
                    )}
                  </td>
                  <td className="p-3">
                    {getStatusBadge(jadwal.status_ujian)}
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