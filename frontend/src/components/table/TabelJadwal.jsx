// src/components/kaprodi/TabelJadwal.jsx

import { useState } from 'react';
import ModalAssignPenguji from '../modal/AssignPenguji';

export default function TabelJadwal({ jadwals, loading, onEdit, onDelete, onRefresh }) {
  const [assignModal, setAssignModal] = useState({ isOpen: false, jadwalId: null });

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'border-gray-600 text-gray-600 bg-gray-50',
      terjadwal: 'border-blue-600 text-blue-600 bg-blue-50',
      selesai: 'border-green-600 text-green-600 bg-green-50',
    };
    const labels = {
      draft: 'Draft',
      terjadwal: 'Terjadwal',
      selesai: 'Selesai',
    };
    return <span className={`px-2 py-1 text-xs border ${styles[status]}`}>{labels[status]}</span>;
  };

  const isSelesai = (tanggal) => {
    return new Date(tanggal) < new Date();
  };

  const handleAssignSuccess = () => {
    setAssignModal({ isOpen: false, jadwalId: null });
    onRefresh();
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <>
      <div className="border border-gray-800 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="p-3 text-left border-r border-gray-300">No</th>
              <th className="p-3 text-left border-r border-gray-300">Nama Mahasiswa</th>
              <th className="p-3 text-left border-r border-gray-300">Bentuk TA</th>
              <th className="p-3 text-left border-r border-gray-300">Jenis Uji</th>
              <th className="p-3 text-left border-r border-gray-300">Hari/Tanggal</th>
              <th className="p-3 text-left border-r border-gray-300">Jam</th>
              <th className="p-3 text-left border-r border-gray-300">Penguji</th>
              <th className="p-3 text-left border-r border-gray-300">Status</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {jadwals.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500">
                  Tidak ada jadwal
                </td>
              </tr>
            ) : (
              jadwals.map((jadwal, index) => {
                const selesai = isSelesai(jadwal.tanggal_ujian);
                const status = selesai ? 'selesai' : jadwal.status_jadwal;

                return (
                  <tr key={jadwal.id} className="border-b border-gray-300">
                    <td className="p-3 border-r border-gray-300">{index + 1}</td>
                    <td className="p-3 border-r border-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">{jadwal.mahasiswa?.nama}</p>
                          <p className="text-xs text-gray-500">{jadwal.mahasiswa?.nim}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 border-r border-gray-300 capitalize">{jadwal.mahasiswa?.bentuk_ta}</td>
                    <td className="p-3 border-r border-gray-300">
                      {jadwal.jenis_ujian.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="p-3 border-r border-gray-300">
                      {jadwal.hari}, {new Date(jadwal.tanggal_ujian).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3 border-r border-gray-300">
                      {jadwal.jam_mulai} - {jadwal.jam_selesai}
                    </td>
                    <td className="p-3 border-r border-gray-300">
                      {jadwal.penguji && jadwal.penguji.length > 0 ? (
                        <div className="text-sm">
                          {jadwal.penguji.map((p, i) => (
                            <div key={i}>{p.nama}, M.Pd.</div>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssignModal({ isOpen: true, jadwalId: jadwal.id })}
                          className="px-3 py-1 border border-gray-800 text-sm hover:bg-gray-50"
                        >
                          + Tambah Penugasan
                        </button>
                      )}
                    </td>
                    <td className="p-3 border-r border-gray-300">{getStatusBadge(status)}</td>
                    <td className="p-3 flex gap-2">
                      <button className="text-lg" title="Lihat">👁️</button>
                      {!selesai && (
                        <>
                          <button onClick={() => onEdit(jadwal.id)} className="text-lg" title="Edit">✏️</button>
                          <button onClick={() => onDelete(jadwal.id)} className="text-lg" title="Hapus">🗑️</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Assign Penguji */}
      <ModalAssignPenguji
        isOpen={assignModal.isOpen}
        jadwalId={assignModal.jadwalId}
        onClose={() => setAssignModal({ isOpen: false, jadwalId: null })}
        onSuccess={handleAssignSuccess}
      />
    </>
  );
}