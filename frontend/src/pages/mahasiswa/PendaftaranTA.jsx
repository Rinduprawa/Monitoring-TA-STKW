import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ConfirmDeleteModal from '../../components/modal/ConfirmDelete';
import FilePreview from '../../components/modal/FilePreview';
import TitleWithInfo from '../../components/common/TitleWithInfo';

export default function PendaftaranTA() {
  const navigate = useNavigate();
  const [pendaftarans, setPendaftarans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [preview, setPreview] = useState({ isOpen: false, fileUrl: null, fileName: null });
  const [canCreate, setCanCreate] = useState(true);

  const tooltipItems = [
    'Surat Permohonan',
    'Bukti Uang Gedung Lunas',
    'Kuitansi SPP',
    'Kuitansi Biaya TA',
    'KHS Semester Lalu',
    'KRS Semester Ini',
    'Transkrip Nilai',
    'Dokumen Proyeksi TA',
  ];

  useEffect(() => {
    fetchPendaftarans();
  }, []);

  const fetchPendaftarans = async () => {
    try {
      const response = await api.get('/pendaftaran-ta');
      // response.data.data atau response.data tergantung controller
      const data = response.data.data || response.data;
      setPendaftarans(data);
      // Check if ada pendaftaran yang menunggu validasi
      if (data.length === 0) {
        setCanCreate(true);
      } else {
        const latest = data[0]; // karena sudah orderBy desc
        const blocked = latest.status_validasi === 'menunggu' || 
                        latest.status_validasi === 'valid';

        setCanCreate(!blocked);
      }
    } catch (error) {
      console.error('Failed to fetch pendaftaran:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/pendaftaran-ta/${deleteModal.id}`);
      fetchPendaftarans();
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus pendaftaran');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'menunggu': 'border-yellow-600 text-yellow-600 bg-yellow-50',
      'valid': 'border-green-600 text-green-600 bg-green-50',
      'tidak_valid': 'border-red-600 text-red-600 bg-red-50',
      'menunggu_validasi': 'border-yellow-600 text-yellow-600 bg-yellow-50',
    };
    const labels = {
      'menunggu': 'Menunggu',
      'valid': 'Valid',
      'tidak_valid': 'Tidak Valid',
      'menunggu_validasi': 'Belum disetujui',
    };
    return <span className={`px-2 py-1 text-xs border ${styles[status]}`}>{labels[status]}</span>;
  };

  const canEdit = (status) => status === 'menunggu';

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold mb-2">Pendaftaran Tugas Akhir Mahasiswa</h1>
        <TitleWithInfo
          title="Lihat Persyaratan"
          tooltipTitle="Persyaratan Pendaftaran Tugas Akhir:"
          tooltipItems={tooltipItems}
        />
      <button
        onClick={() => navigate('/mahasiswa/pendaftaran-ta/create')}
        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={!canCreate}
      >
        + Daftar
      </button>
      </div>

      {pendaftarans.length === 0 ? (
        <div className="bg-white border border-gray-300 p-8 text-center text-gray-500">
          Belum ada pendaftaran. Klik tombol "Daftar" untuk membuat pendaftaran baru.
        </div>
      ) : (
        <div className="space-y-6">
          {pendaftarans.map((pendaftaran) => (
            <div key={pendaftaran.id} className="bg-white border border-gray-300">
              {/* Header Pendaftaran */}
              <div className="border-b border-gray-300 p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Pendaftaran Anda</h3>
                  <p className="text-sm text-gray-600">
                    Tanggal Pendaftaran: {new Date(pendaftaran.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {canEdit(pendaftaran.status_validasi) && (
                    <>
                      <button
                        onClick={() => navigate(`/mahasiswa/pendaftaran-ta/edit/${pendaftaran.id}`)}
                        className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
                      >
                        Ubah Data
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: pendaftaran.id })}
                        className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50"
                      >
                        Hapus Data
                      </button>
                    </>
                  )}
                  {!canEdit(pendaftaran.status_validasi) && (
                    <span
                      className={`text-sm italic ${
                        pendaftaran.status_validasi === 'valid'
                          ? 'text-green-600'
                          : pendaftaran.status_validasi === 'tidak_valid'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {pendaftaran.status_validasi === 'valid' && 'Disetujui'}
                      {pendaftaran.status_validasi === 'tidak_valid' && 'Ditolak'}
                    </span>
                  )}
                </div>
              </div>

              {/* Tabel Berkas */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Nama Dokumen</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Catatan Kaprodi</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Berkas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendaftaran.berkas_pendaftaran?.map((berkas) => (
                      <tr key={berkas.id} className="border-b border-gray-200">
                        <td className="px-4 py-3">
                          {berkas.jenis_berkas.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(berkas.status)}</td>
                        <td className="px-4 py-3 text-sm">{berkas.catatan || '-'}</td>
                        <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                const filename = berkas.file_path?.split('/')?.pop() || `berkas-${berkas.id}`;
                                // use protected API endpoint (no /download)
                                const url = `http://localhost:8000/api/berkas-pendaftaran/${berkas.id}`;
                                setPreview({ isOpen: true, fileUrl: url, fileName: filename });
                              }}
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <span>👁</span> Lihat
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        message="Apakah Anda yakin ingin menghapus data pendaftaran ini?"
      />
      <FilePreview
        isOpen={preview.isOpen}
        onClose={() => setPreview({ isOpen: false, fileUrl: null, fileName: null })}
        fileUrl={preview.fileUrl}
        fileName={preview.fileName}
      />
    </div>
  );
}
