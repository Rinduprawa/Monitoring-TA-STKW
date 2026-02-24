// src/components/kaprodi/TabelPenugasan.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilePreviewModal from '../../components/modal/FilePreview';

export default function TabelPenugasan({ penugasan, kategori, loading, onDelete }) {
  const [expandedDosen, setExpandedDosen] = useState(new Set());
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });
  const navigate = useNavigate();

  const toggleDosen = (dosenId) => {
    const newExpanded = new Set(expandedDosen);
    if (newExpanded.has(dosenId)) {
      newExpanded.delete(dosenId);
    } else {
      newExpanded.add(dosenId);
    }
    setExpandedDosen(newExpanded);
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

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <>
    <div className="border border-gray-800 bg-white">
      <table className="w-full">
        <thead className="border-b border-gray-800">
          <tr>
            <th className="p-3 text-left border-r border-gray-300 w-12">No</th>
            <th className="p-3 text-left border-r border-gray-300">Nama Dosen</th>
            <th className="p-3 text-left border-r border-gray-300">Nama Mahasiswa</th>
            <th className="p-3 text-left border-r border-gray-300">Bentuk TA</th>
            <th className="p-3 text-left border-r border-gray-300">Sebagai</th>
            {kategori === 'penguji' && (
              <th className="p-3 text-left border-r border-gray-300">Jenis Ujian</th>
            )}
            <th className="p-3 text-left border-r border-gray-300">Surat Tugas</th>
            <th className="p-3 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {penugasan.length === 0 ? (
            <tr>
              <td colSpan={kategori === 'penguji' ? "8" : "7"} className="p-4 text-center text-gray-500">
                Tidak ada penugasan
              </td>
            </tr>
          ) : (
            penugasan.map((group, groupIndex) => (
              <>
                {/* Dosen Row (Main) */}
                <tr
                  key={`dosen-${group.dosen_id}`}
                  className="border-b border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleDosen(group.dosen_id)}
                >
                  <td className="p-3 border-r border-gray-300 font-bold">
                    {groupIndex + 1}
                  </td>
                  <td className="p-3 border-r border-gray-300" colSpan={kategori === 'penguji' ? "7" : "6"}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {expandedDosen.has(group.dosen_id) ? '▼' : '▶'}
                      </span>
                      <div className="w-8 h-8 bg-gray-200 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{group.dosen_nama}</p>
                        <p className="text-xs text-gray-500">{group.dosen_nip}</p>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Nested Mahasiswa Rows */}
                {expandedDosen.has(group.dosen_id) && group.penugasan.map((item, itemIndex) => (
                  <tr key={item.id} className="border-b border-gray-200 bg-white">
                    <td className="p-3 border-r border-gray-300"></td>
                    <td className="p-3 border-r border-gray-300"></td>
                    <td className="p-3 border-r border-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm">{item.mahasiswa_nama}</p>
                          <p className="text-xs text-gray-500">{item.mahasiswa_nim}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 border-r border-gray-300 capitalize text-sm">
                      {item.bentuk_ta}
                    </td>
                    <td className="p-3 border-r border-gray-300 text-sm">
                      {getJenisLabel(item.jenis_penugasan)}
                    </td>
                    {kategori === 'penguji' && (
                      <td className="p-3 border-r border-gray-300 text-sm">
                        {getJenisUjianLabel(item.jenis_ujian)}
                      </td>
                    )}
                {/* Surat Tugas Cell - ADD PREVIEW */}
                <td className="p-3 border-r border-gray-300 text-sm">
                  {item.surat_tugas ? (
                    <button 
                      onClick={() => setPreviewModal({
                        isOpen: true,
                        fileUrl: `/kaprodi/penugasan-dosen/${item.id}/preview-surat`,
                        fileName: 'Surat Tugas'
                      })}
                      className="text-blue-600 hover:underline"
                    >
                      📄 {item.surat_tugas.split('/').pop()}
                    </button>
                  ) : '-'}
                </td>
                    <td className="p-3 flex gap-2">
                      <button 
                        onClick={() => navigate(`/kaprodi/penugasan-dosen/${item.id}`)}
                        className="text-lg" 
                        title="Lihat"
                      >
                        👁️
                      </button>
                      <button 
                        onClick={() => navigate(`/kaprodi/penugasan-dosen/edit/${item.id}`)}
                        className="text-lg" 
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="text-lg" 
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            ))
          )}
        </tbody>
      </table>
    </div>

      <FilePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', fileName: '' })}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
      />
    </>
  );
}