// src/components/common/StatusCard.jsx

export default function StatusCard({ 
  statusPendaftaran, 
  statusProposal,
  nilaiProposal,
  thresholdProposal,
  jadwalProposal, // ← Info jadwal ujian proposal
  onNavigate 
}) {
  // Belum daftar
  if (!statusPendaftaran) {
    return (
      <div className="bg-blue-50 border border-blue-300 p-6 rounded">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Anda Belum Mendaftar Tugas Akhir
        </h3>
        <p className="text-blue-700 mb-4">
          Silakan mendaftar Tugas Akhir untuk memulai proses bimbingan.
        </p>
        <button
          onClick={() => onNavigate('/mahasiswa/pendaftaran-ta')}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          Daftar Sekarang
        </button>
      </div>
    );
  }

  // Pendaftaran diproses
  if (statusPendaftaran === 'menunggu') {
    return (
      <div className="bg-yellow-50 border border-yellow-300 p-6 rounded">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          Pendaftaran Sedang Diproses
        </h3>
        <p className="text-yellow-700">
          Pendaftaran Anda sedang dalam proses validasi oleh Kaprodi. Mohon menunggu konfirmasi.
        </p>
      </div>
    );
  }

  // Pendaftaran ditolak
  if (statusPendaftaran === 'tidak_valid') {
    return (
      <div className="bg-red-50 border border-red-300 p-6 rounded">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Pendaftaran Ditolak
        </h3>
        <p className="text-red-700 mb-4">
          Pendaftaran Anda ditolak oleh Kaprodi. Silakan periksa berkas dan daftar kembali.
        </p>
        <button
          onClick={() => onNavigate('/mahasiswa/pendaftaran-ta')}
          className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
        >
          Daftar Ulang
        </button>
      </div>
    );
  }

  // Pendaftaran disetujui, belum ajukan proposal
  if (statusPendaftaran === 'valid' && !statusProposal) {
    return (
      <div className="bg-green-50 border border-green-300 p-6 rounded">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Pendaftaran Disetujui
        </h3>
        <p className="text-green-700 mb-4">
          Selamat! Pendaftaran Anda telah disetujui. Silakan ajukan proposal Tugas Akhir.
        </p>
        <button
          onClick={() => onNavigate('/mahasiswa/pengajuan-proposal')}
          className="px-4 py-2 bg-green-600 text-white hover:bg-green-700"
        >
          Ajukan Proposal
        </button>
      </div>
    );
  }

  // Proposal diproses
  if (statusProposal === 'diproses') {
    return (
      <div className="bg-yellow-50 border border-yellow-300 p-6 rounded">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          Proposal Sedang Diproses
        </h3>
        <p className="text-yellow-700">
          Pengajuan proposal Anda sedang dalam proses validasi oleh Kaprodi.
        </p>
      </div>
    );
  }

  // Proposal ditolak
  if (statusProposal === 'ditolak') {
    return (
      <div className="bg-red-50 border border-red-300 p-6 rounded">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Proposal Ditolak
        </h3>
        <p className="text-red-700">
          Proposal Anda ditolak oleh Kaprodi. Silakan mengulang di semester berikutnya.
        </p>
      </div>
    );
  }

  // Proposal disetujui tapi nilai < threshold
  if (statusProposal === 'disetujui' && nilaiProposal > 0 && nilaiProposal < thresholdProposal) {
    return (
      <div className="bg-red-50 border border-red-300 p-6 rounded">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Ujian Proposal Tidak Lulus
        </h3>
        <p className="text-red-700 mb-2">
          Anda dinyatakan tidak lulus ujian proposal dengan nilai {nilaiProposal} (threshold: {thresholdProposal}).
        </p>
        <p className="text-red-700">
          Silakan mengulang di semester berikutnya.
        </p>
      </div>
    );
  }

  // Proposal disetujui, menunggu ujian/nilai
  if (statusProposal === 'disetujui' && (!nilaiProposal || nilaiProposal === 0)) {
    return (
      <div className="bg-green-50 border border-green-300 p-6 rounded">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Proposal Disetujui
        </h3>
        
        {jadwalProposal ? (
          // Jadwal sudah ada
          <div>
            <p className="text-green-700 mb-4">
              Selamat! Proposal Anda telah disetujui. Berikut jadwal ujian proposal Anda:
            </p>
            <div className="bg-white border border-green-300 p-4 rounded mb-4">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Tanggal Ujian</p>
                  <p className="text-gray-900">
                    {new Date(jadwalProposal.tanggal_ujian).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Waktu</p>
                  <p className="text-gray-900">{jadwalProposal.waktu_mulai} - {jadwalProposal.waktu_selesai}</p>
                </div>
              </div>
              
              {jadwalProposal.penguji && jadwalProposal.penguji.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="font-semibold text-gray-700 mb-2">Penguji:</p>
                  <ul className="list-disc list-inside text-sm text-gray-900">
                    {jadwalProposal.penguji.map((p, i) => (
                      <li key={i}>{p.nama} ({p.nip})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Jadwal belum ada
          <div>
            <p className="text-green-700 mb-2">
              Selamat! Proposal Anda telah disetujui.
            </p>
            <p className="text-yellow-700 bg-yellow-50 border border-yellow-300 p-3 rounded">
              ℹ️ Jadwal ujian proposal belum tersedia. Silakan menunggu informasi lebih lanjut dari Kaprodi.
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
