export const menuConfig = {
  admin: [
    {
      items: [
        { path: '/admin/dashboard', label: 'Dasbor', icon: '☒' },
        { path: '/admin/data-pengguna', label: 'Data Pengguna', icon: '☒' },
      ]
    }
  ],
  
  mahasiswa: [
    {
      items: [
        { path: '/mahasiswa/dashboard', label: 'Dasbor', icon: '☒' },
      ]
    },
    {
      items: [
        { path: '/mahasiswa/pendaftaran', label: 'Pendaftaran Tugas Akhir', icon: '☒' },
        { path: '/mahasiswa/proposal', label: 'Pengajuan Proposal', icon: '☒' },
        { path: '/mahasiswa/ujian', label: 'Pengajuan Ujian', icon: '☒' },
      ]
    },
    {
      items: [
        { path: '/mahasiswa/bimbingan', label: 'Bimbingan', icon: '☒' },
        { path: '/mahasiswa/jadwal', label: 'Jadwal', icon: '☒' },
      ]
    },
    {
      items: [
        { path: '/mahasiswa/penilaian', label: 'Penilaian', icon: '☒' },
        { path: '/mahasiswa/berkas', label: 'Berkas Tugas Akhir', icon: '☒' },
      ]
    },
  ],

  dosen: [
    {
      items: [
        { path: '/dosen/dashboard', label: 'Dasbor', icon: '☒' },
      ]
    },
    {
      items: [
        { path: '/dosen/jadwal', label: 'Jadwal', icon: '☒' },
        { path: '/dosen/penugasan', label: 'Penugasan', icon: '☒' },
      ]
    },
    {
      items: [
        { path: '/dosen/bimbingan', label: 'Bimbingan', icon: '☒' },
        { path: '/dosen/pengajuan-ujian', label: 'Pengajuan Ujian', icon: '☒' },
      ]
    },
    {
      items: [
        { path: '/dosen/penilaian', label: 'Penilaian', icon: '☒' },
        { path: '/dosen/berkas', label: 'Berkas Tugas Akhir', icon: '☒' },
      ]
    },
  ],

  kaprodi: [
    {
      items: [
        { path: '/kaprodi/dashboard', label: 'Dasbor', icon: '☒' },
      ]
    },
    {
      items: [
        { path: '/kaprodi/validasi-pendaftaran', label: 'Validasi Pendaftaran', icon: '☒' },
        { path: '/kaprodi/validasi-proposal', label: 'Validasi Proposal', icon: '☒' },
        { path: '/kaprodi/validasi-ujian', label: 'Validasi Ujian', icon: '☒' },
      ]
    },
    {
      items: [
        { path: '/kaprodi/jadwal', label: 'Jadwal Ujian', icon: '☒' },
        { path: '/kaprodi/penugasan', label: 'Penugasan Dosen', icon: '☒' },
      ]
    },
    {
      items: [
        { path: '/kaprodi/penilaian', label: 'Penilaian', icon: '☒' },
        { path: '/kaprodi/berkas', label: 'Berkas Tugas Akhir', icon: '☒' },
      ]
    },
  ],
};

export const roleLabels = {
  admin: 'Administrator',
  mahasiswa: 'Mahasiswa',
  dosen: 'Dosen',
  kaprodi: 'Kepala Program Studi',
};