// src/pages/dosen/PengajuanUjian.jsx

import { useState, useEffect } from 'react';
import api from '../../services/api';
import FilePreview from '../../components/modal/FilePreview';

export default function PengajuanUjian() {
  const [activeTab, setActiveTab] = useState('kelayakan_tahap_1');
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState({
    isOpen: false,
    url: '',
    name: ''
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '', // 'approve' or 'reject'
    id: null,
    catatan: ''
  });

  const tabs = [
    { key: 'kelayakan_tahap_1', label: 'Kelayakan / Tahap 1', jenis: ['uji_kelayakan_1', 'tes_tahap_1'] },
    { key: 'kelayakan_tahap_2', label: 'Kelayakan / Tahap 2', jenis: ['uji_kelayakan_2', 'tes_tahap_2'] },
    { key: 'pegelaran', label: 'Pegelaran', jenis: ['pergelaran'] },
    { key: 'sidang_akhir', label: 'Sidang Akhir', jenis: ['sidang_skripsi', 'sidang_komprehensif'] },
  ];

  useEffect(() => {
    fetchPengajuan();
  }, [activeTab]);

  const fetchPengajuan = async () => {
    setLoading(true);
    try {
      const currentTab = tabs.find(t => t.key === activeTab);
      const response = await api.get('/dosen/pengajuan-ujian', {
        params: { jenis_ujian: currentTab.jenis.join(',') }
      });
      setPengajuan(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pengajuan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getJenisUjianLabel = (jenis) => {
    const labels = {
      'uji_kelayakan_1': 'Kelayakan 1',
      'tes_tahap_1': 'Tahap 1',
      'uji_kelayakan_2': 'Kelayakan 2',
      'tes_tahap_2': 'Tahap 2',
      'pergelaran': 'Pergelaran',
      'sidang_skripsi': 'Sidang Skripsi',
      'sidang_komprehensif': 'Sidang Komprehensif',
    };
    return labels[jenis] || jenis;
  };

  const openConfirmModal = (type, id) => {
    setConfirmModal({
      isOpen: true,
      type,
      id,
      catatan: ''
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: '',
      id: null,
      catatan: ''
    });
  };

  const handleApprove = async () => {
    try {
      await api.post(`/dosen/pengajuan-ujian/${confirmModal.id}/approve`);
      alert('Pengajuan berhasil disetujui');
      closeConfirmModal();
      fetchPengajuan();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert(error.response?.data?.message || 'Gagal menyetujui pengajuan');
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/dosen/pengajuan-ujian/${confirmModal.id}/reject`, {
        catatan: confirmModal.catatan
      });
      alert('Pengajuan berhasil ditolak');
      closeConfirmModal();
      fetchPengajuan();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert(error.response?.data?.message || 'Gagal menolak pengajuan');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Data Pengajuan Mengikuti Ujian TA Mahasiswa</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 border border-gray-800 ${
              activeTab === tab.key ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : pengajuan.length === 0 ? (
        <div className="border border-gray-300 bg-white p-8 text-center text-gray-500">
          Belum ada pengajuan
        </div>
      ) : (
        <div className="border border-gray-800 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="p-3 text-left border-r border-gray-300">No</th>
                <th className="p-3 text-left border-r border-gray-300">Nama Mahasiswa</th>
                <th className="p-3 text-left border-r border-gray-300">Bentuk TA</th>
                <th className="p-3 text-left border-r border-gray-300">Jenis Uji</th>
                <th className="p-3 text-left border-r border-gray-300">Tanggal Pengajuan</th>
                <th className="p-3 text-left border-r border-gray-300">Berkas</th>
                <th className="p-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pengajuan.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="p-3 border-r border-gray-300">{index + 1}</td>
                  <td className="p-3 border-r border-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{item.mahasiswa?.nama}</p>
                        <p className="text-xs text-gray-500">{item.mahasiswa?.nim}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 border-r border-gray-300 capitalize">{item.mahasiswa?.bentuk_ta}</td>
                  <td className="p-3 border-r border-gray-300">{getJenisUjianLabel(item.jenis_ujian)}</td>
                  <td className="p-3 border-r border-gray-300">
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="p-3 border-r border-gray-300">
                    <button
                      onClick={() => setPreviewFile({
                        isOpen: true,
                        url: `/dosen/pengajuan-ujian/${item.id}/preview-bukti?t=${Date.now()}`,
                        name: 'Bukti Kelayakan'
                      })}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      📄 Bukti Kelayakan
                    </button>
                  </td>
                  <td className="p-3">
                    {item.status === 'diproses_pembimbing' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openConfirmModal('approve', item.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm hover:bg-green-700"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => openConfirmModal('reject', item.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm hover:bg-red-700"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="px-2 py-1 text-xs border bg-gray-50 border-gray-600 text-gray-600">
                        {item.status === 'disetujui_pembimbing' ? 'Disetujui' : 'Ditolak'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreview
        isOpen={previewFile.isOpen}
        onClose={() => setPreviewFile({ isOpen: false, url: '', name: '' })}
        fileUrl={previewFile.url}
        fileName={previewFile.name}
      />

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              {confirmModal.type === 'approve' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'}
            </h3>
            
            <p className="mb-4">
              {confirmModal.type === 'approve' 
                ? 'Apakah Anda yakin ingin menyetujui pengajuan ujian ini?' 
                : 'Apakah Anda yakin ingin menolak pengajuan ujian ini?'}
            </p>

            {confirmModal.type === 'reject' && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Catatan (Opsional)</label>
                <textarea
                  value={confirmModal.catatan}
                  onChange={(e) => setConfirmModal(prev => ({ ...prev, catatan: e.target.value }))}
                  className="w-full p-2 border border-gray-300"
                  rows="3"
                  placeholder="Alasan penolakan..."
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 border border-gray-800"
              >
                Batal
              </button>
              <button
                onClick={confirmModal.type === 'approve' ? handleApprove : handleReject}
                className={`px-4 py-2 text-white ${
                  confirmModal.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmModal.type === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}