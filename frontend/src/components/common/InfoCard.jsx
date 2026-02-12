// src/components/common/InfoCard.jsx

export default function InfoCard({ mahasiswa, tanggalUjianTerdekat }) {
  return (
    <div className="bg-white border border-gray-300 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Informasi Tugas Akhir</h3>
        {mahasiswa?.bentuk_ta && (
          <span className="px-3 py-1 border border-gray-800 text-sm capitalize">
            {mahasiswa.bentuk_ta}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">
            Judul skripsi, yaitu{' '}
            <span className="font-medium text-black">
              {mahasiswa?.judul_ta || 'Belum ada judul'}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold mb-1">Pembimbing 1</p>
            <p className="text-sm">{mahasiswa?.dosen_pembimbing1?.nama || '-'}</p>
            <p className="text-xs text-gray-500">{mahasiswa?.dosen_pembimbing1?.nip || '-'}</p>
          </div>

          <div>
            <p className="font-semibold mb-1">Pembimbing 2</p>
            <p className="text-sm">{mahasiswa?.dosen_pembimbing2?.nama || '-'}</p>
            <p className="text-xs text-gray-500">{mahasiswa?.dosen_pembimbing2?.nip || '-'}</p>
          </div>

          <div>
            <p className="font-semibold mb-1">Jadwal Ujian Terdekat</p>
            <p className="text-sm">
              {tanggalUjianTerdekat 
                ? new Date(tanggalUjianTerdekat).toLocaleDateString('id-ID')
                : 'Belum dijadwalkan'
              }
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Status Tugas Akhir</p>
            <p className="text-sm capitalize">{mahasiswa?.tahap_ta?.replace(/_/g, ' ') || 'Dalam Proses'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}