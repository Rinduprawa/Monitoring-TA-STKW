// src/components/mahasiswa/RiwayatBimbingan.jsx

import { useNavigate } from 'react-router-dom';

export default function RiwayatBimbingan({ bimbingans = [] }) {
  const navigate = useNavigate();

  // Mock data if empty
  const displayBimbingans = bimbingans.length > 0 ? bimbingans : [
    { id: 1, judul_bimbingan: 'Judul bimbingan', tanggal_bimbingan: '2024-01-15' },
    { id: 2, judul_bimbingan: 'Judul bimbingan', tanggal_bimbingan: '2024-01-20' },
    { id: 3, judul_bimbingan: 'Judul bimbingan', tanggal_bimbingan: '2024-01-25' },
    { id: 4, judul_bimbingan: 'Judul bimbingan', tanggal_bimbingan: '2024-02-01' },
  ];

  return (
    <div className="bg-white border border-gray-300 p-6">
      <h3 className="text-lg font-semibold mb-4">Riwayat Bimbingan</h3>

      <div className="space-y-3">
        {displayBimbingans.slice(0, 4).map((bimbingan) => (
          <div
            key={bimbingan.id}
            className="flex items-center justify-between border border-gray-300 p-4"
          >
            <div className="flex items-center gap-3">
              {/* Icon placeholder */}
              <div className="w-8 h-8 bg-gray-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>

              <div>
                <p className="font-medium">{bimbingan.judul_bimbingan}</p>
                <p className="text-sm text-gray-500">
                  {new Date(bimbingan.tanggal_bimbingan).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/mahasiswa/bimbingan/${bimbingan.id}`)}
              className="px-3 py-1 border border-gray-300 hover:bg-gray-50 text-sm"
            >
              Lihat Detail
            </button>
          </div>
        ))}
      </div>

      {displayBimbingans.length > 4 && (
        <button
          onClick={() => navigate('/mahasiswa/bimbingan')}
          className="w-full mt-4 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-sm"
        >
          Lihat Semua Bimbingan
        </button>
      )}
    </div>
  );
}
