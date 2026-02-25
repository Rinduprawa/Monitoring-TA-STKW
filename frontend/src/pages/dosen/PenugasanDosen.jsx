// src/pages/dosen/PenugasanDosen.jsx

import { useState, useEffect } from 'react';
import api from '../../services/api';
import FilePreviewModal from '../../components/modal/FilePreview';

export default function PenugasanDosen() {
  const [activeTab, setActiveTab] = useState('pembimbing');
  const [penugasan, setPenugasan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMhs, setExpandedMhs] = useState(new Set());
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });

  useEffect(() => {
    fetchPenugasan();
  }, [activeTab]);

  const fetchPenugasan = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'pembimbing' 
        ? '/dosen/penugasan/pembimbing'
        : '/dosen/penugasan/penguji';
      
      const response = await api.get(endpoint);
      setPenugasan(response.data.data);
    } catch (error) {
      console.error('Failed to fetch penugasan:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMahasiswa = (mhsId) => {
    const newExpanded = new Set(expandedMhs);
    if (newExpanded.has(mhsId)) {
      newExpanded.delete(mhsId);
    } else {
      newExpanded.add(mhsId);
    }
    setExpandedMhs(newExpanded);
  };

  const getJenisLabel = (jenis) => {
    const labels = {
      'pembimbing_1': 'Pembimbing 1',
      'pembimbing_2': 'Pembimbing 2',
      'penguji_struktural': 'Penguji Struktural',
      'penguji_ahli': 'Penguji Ahli',
      'penguji_pembimbing': 'Penguji Pembimbing',
      'penguji_stakeholder': 'Penguji Stakeholder',
    };
    return labels[jenis] || jenis;
  };

  const getJenisUjianLabel = (jenisUjian) => {
    const labels = {
      'proposal': 'Proposal',
      'uji_kelayakan_1': 'Kelayakan 1',
      'tes_tahap_1': 'Tahap 1',
      'uji_kelayakan_2': 'Kelayakan 2',
      'tes_tahap_2': 'Tahap 2',
      'pergelaran': 'Pergelaran',
      'sidang_skripsi': 'Sidang Skripsi',
      'sidang_komprehensif': 'Sidang Komprehensif',
    };
    return labels[jenisUjian] || jenisUjian;
  };

  const formatPelaksanaan = (jadwal) => {
    if (!jadwal) return '-';

    const date = new Date(jadwal.tanggal_ujian);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const hari = days[date.getDay()];
    const tanggal = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    const waktu = `${jadwal.waktu_mulai.slice(0, 5)} - ${jadwal.waktu_selesai.slice(0, 5)}`;

    return { hari, tanggal, waktu };
  };

  const handlePreview = (penugasanId, fileName) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:8000/api/dosen/penugasan/${penugasanId}/preview-surat?token=${token}`;
    
    setPreviewModal({
      isOpen: true,
      fileUrl: url,
      fileName: fileName || 'Surat Tugas'
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Penugasan Dosen</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('pembimbing')}
          className={`px-6 py-2 border ${
            activeTab === 'pembimbing'
              ? 'border-gray-800 bg-gray-100 font-semibold'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          Pembimbing
        </button>
        <button
          onClick={() => setActiveTab('penguji')}
          className={`px-6 py-2 border ${
            activeTab === 'penguji'
              ? 'border-gray-800 bg-gray-100 font-semibold'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          Penguji
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : penugasan.length === 0 ? (
        <div className="border border-gray-300 bg-white p-8 text-center text-gray-500">
          Belum ada penugasan dari kaprodi
        </div>
      ) : (
        <div className="border border-gray-800 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="p-3 text-left border-r border-gray-300 w-12">No</th>
                <th className="p-3 text-left border-r border-gray-300">Nama Mahasiswa</th>
                {activeTab === 'pembimbing' && (
                  <th className="p-3 text-left border-r border-gray-300">Judul TA</th>
                )}
                <th className="p-3 text-left border-r border-gray-300">Bentuk TA</th>
                {activeTab === 'penguji' && (
                  <>
                    <th className="p-3 text-left border-r border-gray-300">Jenis Ujian</th>
                    <th className="p-3 text-left border-r border-gray-300">Pelaksanaan Ujian</th>
                  </>
                )}
                <th className="p-3 text-left border-r border-gray-300">
                  {activeTab === 'pembimbing' ? 'Sebagai' : 'Sebagai Penguji'}
                </th>
                <th className="p-3 text-left">Surat Tugas</th>
              </tr>
            </thead>
            <tbody>
              {penugasan.map((group, groupIndex) => (
                <>
                  {/* Mahasiswa Row (Main) */}
                  <tr
                    key={`mhs-${group.mahasiswa_id}`}
                    className="border-b border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleMahasiswa(group.mahasiswa_id)}
                  >
                    <td className="p-3 border-r border-gray-300 font-bold">
                      {groupIndex + 1}
                    </td>
                    <td 
                      className="p-3 border-r border-gray-300" 
                      colSpan={activeTab === 'pembimbing' ? 4 : 5}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {expandedMhs.has(group.mahasiswa_id) ? '▼' : '▶'}
                        </span>
                        <div className="w-8 h-8 bg-gray-200 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">{group.mahasiswa_nama}</p>
                          <p className="text-xs text-gray-500">{group.mahasiswa_nim}</p>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Nested Penugasan Rows */}
                  {expandedMhs.has(group.mahasiswa_id) && group.penugasan.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 bg-white">
                      <td className="p-3 border-r border-gray-300"></td>
                      <td className="p-3 border-r border-gray-300"></td>
                      
                      {activeTab === 'pembimbing' && (
                        <td className="p-3 border-r border-gray-300 text-sm">
                          {group.mahasiswa_judul_ta || '-'}
                        </td>
                      )}
                      
                      <td className="p-3 border-r border-gray-300 capitalize text-sm">
                        {group.bentuk_ta}
                      </td>
                      
                      {activeTab === 'penguji' && (
                        <>
                          <td className="p-3 border-r border-gray-300 text-sm">
                            {getJenisUjianLabel(item.jenis_ujian)}
                          </td>
                          <td className="p-3 border-r border-gray-300 text-sm">
                            {item.jadwal_ujian ? (
                              <div>
                                <div>{formatPelaksanaan(item.jadwal_ujian).hari}, {formatPelaksanaan(item.jadwal_ujian).tanggal}</div>
                                <div className="text-gray-600">Pukul {formatPelaksanaan(item.jadwal_ujian).waktu}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">Belum dijadwalkan</span>
                            )}
                          </td>
                        </>
                      )}
                      
                      <td className="p-3 border-r border-gray-300 text-sm">
                        {getJenisLabel(item.jenis_penugasan)}
                      </td>
                      
                      <td className="p-3 text-sm">
                        {item.surat_tugas ? (
                          <button
                            onClick={() => handlePreview(item.id, item.surat_tugas.split('/').pop())}
                            className="text-blue-600 hover:underline"
                          >
                            📄 {item.surat_tugas.split('/').pop()}
                          </button>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', fileName: '' })}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
      />
    </div>
  );
}
