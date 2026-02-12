// src/pages/mahasiswa/BerkasTugasAkhir.jsx

import { useState, useEffect } from 'react';
import api from '../../services/api';
import UploadBerkas from '../../components/modal/UploadBerkas';
import FilePreview from '../../components/modal/FilePreview';

export default function BerkasTA() {
  const [berkas, setBerkas] = useState([]);
  const [bentukTA, setBentukTA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState({
    isOpen: false,
    jenisDokumen: null,
    existingBerkas: null,
  });
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileUrl: '',
    fileName: '',
  });

  const jenisDokumenAll = [
    { key: 'naskah_skripsi', label: 'Naskah Skripsi', forPenelitian: true, forPenciptaan: false },
    { key: 'deskripsi_karya_seni', label: 'Deskripsi Karya Seni', forPenelitian: false, forPenciptaan: true },
    { key: 'dokumentasi_pergelaran', label: 'Dokumentasi Foto & Video Pergelaran', forPenelitian: false, forPenciptaan: true },
  ];

  useEffect(() => {
    fetchBerkas();
  }, []);

  const fetchBerkas = async () => {
    try {
      const response = await api.get('/berkas-ta');
      setBerkas(response.data.data.berkas);
      setBentukTA(response.data.data.bentuk_ta);
    } catch (error) {
      console.error('Failed to fetch berkas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBerkasByJenis = (jenis) => {
    return berkas.find(b => b.jenis_dokumen === jenis);
  };

  const isDisabled = (jenisDokumenItem) => {
    if (!bentukTA) return true;
    if (bentukTA === 'penelitian') return !jenisDokumenItem.forPenelitian;
    if (bentukTA === 'penciptaan') return !jenisDokumenItem.forPenciptaan;
    return false;
  };

  const handleUpload = (jenisDokumen) => {
    const existing = getBerkasByJenis(jenisDokumen);
    setUploadModal({
      isOpen: true,
      jenisDokumen: jenisDokumen,
      existingBerkas: existing || null,
    });
  };

  const handleDelete = async (jenisDokumen) => {
    if (!confirm('Yakin ingin menghapus berkas ini?')) return;

    try {
      await api.delete(`/berkas-ta/${jenisDokumen}`);
      fetchBerkas();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus berkas');
    }
  };

  const handlePreview = (berkasData) => {
    const url = `http://localhost:8000/api/berkas-ta/${berkasData.id}`;
    setPreviewModal({
      isOpen: true,
      fileUrl: url,
      fileName: berkasData.jenis_dokumen,
    });
  };

  const handleModalSuccess = () => {
    setUploadModal({ isOpen: false, jenisDokumen: null, existingBerkas: null });
    fetchBerkas();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Berkas-Berkas Tugas Akhir</h1>
        {!bentukTA && (
          <p className="text-sm text-gray-500 mt-2">
            Anda belum dapat mengunggah berkas. Silakan selesaikan pendaftaran dan pengajuan proposal terlebih dahulu.
          </p>
        )}
      </div>

      <div className="border border-gray-800 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="p-3 text-left border-r border-gray-300">
                Nama Dokumen{' '}
                <span className="text-gray-400 cursor-help" title="Info tooltip">ⓘ</span>
              </th>
              <th className="p-3 text-left border-r border-gray-300">Tanggal Unggah</th>
              <th className="p-3 text-left border-r border-gray-300">Berkas</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {jenisDokumenAll.map((jenisDokumenItem) => {
              const disabled = isDisabled(jenisDokumenItem);
              const berkasData = getBerkasByJenis(jenisDokumenItem.key);

              return (
                <tr
                  key={jenisDokumenItem.key}
                  className={`border-b border-gray-300 ${disabled ? 'bg-gray-50' : ''}`}
                >
                  <td className={`p-3 border-r border-gray-300 ${disabled ? 'text-gray-400' : ''}`}>
                    {jenisDokumenItem.label}
                  </td>
                  <td className={`p-3 border-r border-gray-300 ${disabled ? 'text-gray-400' : ''}`}>
                    {berkasData
                      ? new Date(berkasData.created_at).toLocaleDateString('id-ID')
                      : '-'}
                  </td>
                  <td className={`p-3 border-r border-gray-300 ${disabled ? 'text-gray-400' : ''}`}>
                    {berkasData ? (
                      <button
                        onClick={() => handlePreview(berkasData)}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        👁 Lihat
                      </button>
                    ) : '-'}
                  </td>
                  <td className="p-3">
                    {disabled ? (
                      <span className="text-gray-400">-</span>
                    ) : berkasData ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpload(jenisDokumenItem.key)}
                          className="text-lg"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(jenisDokumenItem.key)}
                          className="text-lg"
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpload(jenisDokumenItem.key)}
                        className="px-3 py-1 border border-gray-800 text-sm hover:bg-gray-50"
                      >
                        + Unggah
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Upload/Edit */}
      <UploadBerkas
        isOpen={uploadModal.isOpen}
        jenisDokumen={uploadModal.jenisDokumen}
        existingBerkas={uploadModal.existingBerkas}
        onClose={() => setUploadModal({ isOpen: false, jenisDokumen: null, existingBerkas: null })}
        onSuccess={handleModalSuccess}
      />

      {/* Preview Modal */}
      <FilePreview
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', fileName: '' })}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
      />
    </div>
  );
}