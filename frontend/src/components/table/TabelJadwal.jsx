// src/components/kaprodi/TabelJadwal.jsx

import { useState } from 'react';
import ModalAssignPenguji from '../modal/AssignPenguji';
import { useNavigate } from 'react-router-dom';

export default function TabelJadwal({ jadwals, loading, showJenisColumn, onEdit, onDelete, onRefresh }) {
  const navigate = useNavigate();
  const [assignModal, setAssignModal] = useState({ isOpen: false, jadwal: null });
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

  const getJenisUjiLabel = (jenisUjian, bentukTA) => {
    const labels = {
      'uji_kelayakan_1': 'Uji Kelayakan 1',
      'tes_tahap_1': 'Tes Tahap 1',
      'uji_kelayakan_2': 'Uji Kelayakan 2',
      'tes_tahap_2': 'Tes Tahap 2',
      'sidang_skripsi': 'Sidang Skripsi',
      'sidang_komprehensif': 'Sidang Komprehensif',
    };
    return labels[jenisUjian] || jenisUjian;
  };

  const handleAssignSuccess = () => {
    setAssignModal({ isOpen: false, jadwal: null });
    onRefresh();
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  const isSelesai = (tanggal) => {
    return new Date(tanggal) < new Date();
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
              {showJenisColumn && (
                <th className="p-3 text-left border-r border-gray-300">Jenis Uji</th>
              )}
              <th className="p-3 text-left border-r border-gray-300">Tanggal</th>
              <th className="p-3 text-left border-r border-gray-300">Jam</th>
              <th className="p-3 text-left border-r border-gray-300">Penguji</th>
              <th className="p-3 text-left border-r border-gray-300">Status</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {jadwals.length === 0 ? (
              <tr>
                <td colSpan={showJenisColumn ? "9" : "8"} className="p-4 text-center text-gray-500">
                  Tidak ada jadwal
                </td>
              </tr>
            ) : (
              jadwals.map((jadwal, index) => {
                const selesai = isSelesai(jadwal.tanggal);
                const pengujiCount = jadwal.penguji_count || 0;
                const status = selesai ? 'selesai' : (pengujiCount === 4 ? 'terjadwal' : 'draft');

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
                    
                    {showJenisColumn && (
                      <td className="p-3 border-r border-gray-300">
                        {getJenisUjiLabel(jadwal.jenis_ujian, jadwal.mahasiswa?.bentuk_ta)}
                      </td>
                    )}
                    
                    <td className="p-3 border-r border-gray-300">
                      {jadwal.hari && `${jadwal.hari}, `}
                      {new Date(jadwal.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3 border-r border-gray-300">
                      {jadwal.jam_mulai} - {jadwal.jam_selesai}
                    </td>
                    
                    {/* Penguji Column */}
                    <td className="p-3 border-r border-gray-300">
                      {pengujiCount > 0 ? (
                        <div>
                          <div className="text-sm">
                            {jadwal.penguji.slice(0, 2).map((p, i) => (
                              <div key={i}>{p.dosen?.nama}</div>
                            ))}
                            {pengujiCount > 2 && (
                              <div className="text-xs text-gray-500">+{pengujiCount - 2} lainnya</div>
                            )}
                          </div>
                          {pengujiCount < 4 && !selesai && (
                            <button
                              onClick={() => setAssignModal({ isOpen: true, jadwal })}
                              className="mt-2 px-2 py-1 border border-gray-800 text-xs hover:bg-gray-50"
                            >
                              + Tambah {4 - pengujiCount} Penguji
                            </button>
                          )}
                        </div>
                      ) : (
                        !selesai && (
                          <button
                            onClick={() => setAssignModal({ isOpen: true, jadwal })}
                            className="px-3 py-1 border border-gray-800 text-sm hover:bg-gray-50"
                          >
                            + Tambah Penugasan
                          </button>
                        )
                      )}
                    </td>
                    
                    <td className="p-3 border-r border-gray-300">{getStatusBadge(status)}</td>
  <td className="p-3 flex gap-2">
    <button 
      onClick={() => navigate(`/kaprodi/jadwal-ujian/${jadwal.id}`)} // ← View detail
      className="text-lg" 
      title="Lihat"
    >
      👁️
    </button>
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
        jadwal={assignModal.jadwal}
        onClose={() => setAssignModal({ isOpen: false, jadwal: null })}
        onSuccess={handleAssignSuccess}
      />
    </>
  );
}