// src/pages/admin/UserDetail.jsx

export default function UserDetail({ 
  userData, 
  activeTab, 
  onClose 
}) {
  if (!userData) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium">Detail Pengguna</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
        >
          Kembali
        </button>
      </div>

      <div className="max-w-2xl border border-gray-300 bg-white">
        {/* Header Info */}
        <div className="border-b border-gray-300 p-4 bg-gray-50">
          <h3 className="font-semibold text-lg">
            {activeTab === 'kaprodi' ? userData.dosen?.nama : userData.nama}
          </h3>
          <p className="text-sm text-gray-600">
            {activeTab === 'kaprodi' 
              ? 'Kepala Program Studi' 
              : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
            }
          </p>
        </div>

        {/* Detail Fields */}
        <div className="p-4 space-y-4">
          {/* Nama Lengkap */}
          <div className="flex border-b border-gray-200 pb-3">
            <div className="w-1/3 font-medium text-gray-700">Nama Lengkap</div>
            <div className="w-2/3">
              {activeTab === 'kaprodi' ? userData.dosen?.nama : userData.nama}
            </div>
          </div>

          {/* NIM/NIP */}
          <div className="flex border-b border-gray-200 pb-3">
            <div className="w-1/3 font-medium text-gray-700">
              {activeTab === 'mahasiswa' ? 'NIM' : 'NIP/NIDN'}
            </div>
            <div className="w-2/3">
              {activeTab === 'mahasiswa' 
                ? userData.nim 
                : activeTab === 'kaprodi'
                ? userData.dosen?.nip
                : userData.nip
              }
            </div>
          </div>

          {/* Program Studi */}
          <div className="flex border-b border-gray-200 pb-3">
            <div className="w-1/3 font-medium text-gray-700">Program Studi</div>
            <div className="w-2/3">{userData.prodi?.nama_prodi || '-'}</div>
          </div>

          {/* Email */}
          <div className="flex border-b border-gray-200 pb-3">
            <div className="w-1/3 font-medium text-gray-700">Email</div>
            <div className="w-2/3">{userData.user?.email || '-'}</div>
          </div>

          {/* Jenis Kelamin - only mahasiswa */}
          {activeTab === 'mahasiswa' && (
            <div className="flex border-b border-gray-200 pb-3">
              <div className="w-1/3 font-medium text-gray-700">Jenis Kelamin</div>
              <div className="w-2/3">
                {userData.jk === 'L' ? 'Laki-laki' : 'Perempuan'}
              </div>
            </div>
          )}

          {/* Status Akun */}
          <div className="flex border-b border-gray-200 pb-3">
            <div className="w-1/3 font-medium text-gray-700">Status Akun</div>
            <div className="w-2/3">
              <span className={`px-2 py-1 text-sm border ${
                userData.user?.is_active 
                  ? 'border-green-600 text-green-600 bg-green-50' 
                  : 'border-red-600 text-red-600 bg-red-50'
              }`}>
                {userData.user?.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>

          {/* Tanggal Dibuat */}
          <div className="flex border-b border-gray-200 pb-3">
            <div className="w-1/3 font-medium text-gray-700">Tanggal Dibuat</div>
            <div className="w-2/3">
              {new Date(userData.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Terakhir Diperbarui */}
          <div className="flex pb-3">
            <div className="w-1/3 font-medium text-gray-700">Terakhir Diperbarui</div>
            <div className="w-2/3">
              {new Date(userData.updated_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}