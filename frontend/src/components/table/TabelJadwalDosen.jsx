// src/components/dosen/TabelJadwal.jsx

import { getJenisUjianLabel, getCountdownStatus, getJenisPengujiLabel } from '../../utils/jadwalHelpers';

export default function TabelJadwal({ jadwals, loading, showJenisColumn }) {
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
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
          </tr>
        </thead>
        <tbody>
          {jadwals.length === 0 ? (
            <tr>
              <td colSpan={showJenisColumn ? "9" : "8"} className="p-4 text-center text-gray-500">
                Tidak ada jadwal ujian
              </td>
            </tr>
          ) : (
            jadwals.map((jadwal, index) => {
              const status = getCountdownStatus(jadwal.tanggal);

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
                      {getJenisUjianLabel(jadwal.jenis_ujian)}
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
                    {jadwal.penguji && jadwal.penguji.length > 0 ? (
                      <div className="text-sm">
                        {jadwal.penguji.map((p, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
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
                  
                  {/* Status with Countdown */}
                  <td className="p-3 border-r border-gray-300">
                    <span className={`px-2 py-1 text-xs border ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}