// src/pages/kaprodi/DetailPenugasan.jsx

import { useState, useEffect } from 'react';
import FilePreviewModal from '../../components/modal/FilePreview';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

export default function DetailPenugasan() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const response = await api.get(`/kaprodi/penugasan-dosen/${id}`);
      console.log('Detail data:', response.data.data); // ← Debug
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch detail:', error);
      alert('Gagal memuat detail penugasan');
      navigate('/kaprodi/penugasan-dosen');
    } finally {
      setLoading(false);
    }
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
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { penugasan, proposal, jadwal_ujian } = data; // ← Get proposal separately
  const isPenguji = ['penguji_struktural', 'penguji_ahli', 'penguji_pembimbing', 'penguji_stakeholder'].includes(penugasan.jenis_penugasan);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Detail Penugasan Dosen</h1>
        <button
          onClick={() => navigate('/kaprodi/penugasan-dosen')}
          className="px-4 py-2 border border-gray-300"
        >
          ← Kembali
        </button>
      </div>

      <div className="bg-white border border-gray-300 p-6 max-w-3xl">
        {/* Mahasiswa Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Informasi Mahasiswa</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nama</p>
              <p className="font-medium">{penugasan.mahasiswa.nama}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">NIM</p>
              <p className="font-medium">{penugasan.mahasiswa.nim}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Judul TA</p>
              <p className="font-medium">{proposal?.judul_ta || penugasan.mahasiswa.judul_ta || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Jenis TA</p>
              <p className="font-medium capitalize">{proposal?.bentuk_ta || penugasan.mahasiswa.bentuk_ta || '-'}</p>
            </div>
          </div>
        </div>

        {/* Proposal File (always visible if an approved proposal exists) */}
        {proposal?.file_proposal && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">File Proposal</h2>
            <button
              onClick={() => setPreviewModal({
                isOpen: true,
                fileUrl: `/pengajuan-proposal/${proposal.id}/preview`,
                name: 'Proposal Mahasiswa'
              })}
              className="text-blue-600 hover:underline"
            >
              📄 Lihat Proposal
            </button>
          </div>
        )}

        {/* Penugasan Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Informasi Penugasan</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Jenis Penugasan</p>
              <p className="font-medium">{getJenisLabel(penugasan.jenis_penugasan)}</p>
            </div>
            {isPenguji && (
              <div>
                <p className="text-sm text-gray-600">Jenis Ujian</p>
                <p className="font-medium">{getJenisUjianLabel(penugasan.jenis_ujian)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Surat Tugas */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Surat Tugas</h2>
          {penugasan.file_surat_tugas ? (
            <button
              onClick={() => setPreviewModal({
                isOpen: true,
                fileUrl: `/kaprodi/penugasan-dosen/${penugasan.id}/preview-surat`,
                fileName: 'Surat Tugas'
              })}
              className="text-blue-600 hover:underline"
            >
              📄 {penugasan.file_surat_tugas.split('/').pop()}
            </button>
          ) : (
            <p className="text-gray-500">Belum ada surat tugas</p>
          )}
        </div>

        {/* Jadwal Ujian (Penguji only) */}
        {isPenguji && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Jadwal Ujian</h2>
            {jadwal_ujian ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tanggal</p>
                  <p className="font-medium">
                    {jadwal_ujian.hari && `${jadwal_ujian.hari}, `}
                    {new Date(jadwal_ujian.tanggal).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jam</p>
                  <p className="font-medium">{jadwal_ujian.jam_mulai} - {jadwal_ujian.jam_selesai}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Jadwal belum dibuat</p>
            )}
          </div>
        )}
      </div>

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