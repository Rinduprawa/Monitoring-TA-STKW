// src/pages/kaprodi/DetailJadwal.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

export default function DetailJadwal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

    const fetchDetail = async () => {
    try {
        const response = await api.get(`/kaprodi/jadwal-ujian/${id}`);
        
        const penugasanResponse = await api.get('/kaprodi/penugasan-dosen/by-mahasiswa-ujian', {
        params: {
            mahasiswa_id: response.data.data.mahasiswa_id,
            jenis_ujian: response.data.data.jenis_ujian
        }
        });
        
        setData({
        jadwal: response.data.data,
        penugasan: penugasanResponse.data.data,
        proposal: response.data.proposal // ← Get from same response
        });
    } catch (error) {
        console.error('Failed to fetch detail:', error);
        alert('Gagal memuat detail jadwal');
        navigate('/kaprodi/jadwal-ujian');
    } finally {
        setLoading(false);
    }
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

  const getJenisLabel = (jenis) => {
    const labels = {
      'penguji_struktural': 'Penguji Struktural',
      'penguji_ahli': 'Penguji Ahli',
      'penguji_pembimbing': 'Penguji Pembimbing',
      'penguji_stakeholder': 'Penguji Stakeholder',
    };
    return labels[jenis] || jenis;
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'border-gray-600 text-gray-600 bg-gray-50',
      terjadwal: 'border-blue-600 text-blue-600 bg-blue-50',
      selesai: 'border-green-600 text-green-600 bg-green-50',
    };
    const labels = {
      draft: 'Draft',
      terjadwal: 'Terjadwal',
      selesai: 'Selesai',
    };
    return (
      <span className={`px-3 py-1 text-sm border ${styles[status]} inline-block`}>
        {labels[status]}
      </span>
    );
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

  const { jadwal, penugasan, proposal } = data;
  const isSelesai = new Date(jadwal.tanggal) < new Date();
  const pengujiCount = penugasan.length;
  const status = isSelesai ? 'selesai' : (pengujiCount === 4 ? 'terjadwal' : 'draft');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Detail Jadwal Ujian</h1>
        <button
          onClick={() => navigate('/kaprodi/jadwal-ujian')}
          className="px-4 py-2 border border-gray-300"
        >
          ← Kembali
        </button>
      </div>

      <div className="bg-white border border-gray-300 p-6 max-w-3xl">
        {/* Status Badge */}
        <div className="mb-6">
          {getStatusBadge(status)}
        </div>

        {/* Mahasiswa Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Informasi Mahasiswa</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nama</p>
              <p className="font-medium">{jadwal.mahasiswa?.nama}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">NIM</p>
              <p className="font-medium">{jadwal.mahasiswa?.nim}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Judul TA</p>
              <p className="font-medium">{proposal?.judul_ta || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bentuk TA</p>
              <p className="font-medium capitalize">{jadwal.mahasiswa?.bentuk_ta}</p>
            </div>
          </div>
        </div>

        {/* Jadwal Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Informasi Jadwal</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Jenis Ujian</p>
              <p className="font-medium">{getJenisUjianLabel(jadwal.jenis_ujian)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tanggal</p>
              <p className="font-medium">
                {jadwal.hari && `${jadwal.hari}, `}
                {new Date(jadwal.tanggal).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Jam Mulai</p>
              <p className="font-medium">{jadwal.jam_mulai}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Jam Selesai</p>
              <p className="font-medium">{jadwal.jam_selesai}</p>
            </div>
          </div>
        </div>

        {/* Penguji Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            Daftar Penguji ({pengujiCount}/4)
          </h2>
          
          {penugasan.length > 0 ? (
            <div className="space-y-3">
              {['penguji_struktural', 'penguji_ahli', 'penguji_pembimbing', 'penguji_stakeholder'].map(jenis => {
                const penguji = penugasan.find(p => p.jenis_penugasan === jenis);
                
                return (
                  <div key={jenis} className="flex items-start gap-3 p-3 border border-gray-200 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{getJenisLabel(jenis)}</p>
                      {penguji ? (
                        <div className="mt-1">
                          <p className="text-sm text-gray-700">{penguji.dosen?.nama}</p>
                          <p className="text-xs text-gray-500">{penguji.dosen?.nip}</p>
                          {penguji.surat_tugas && (
                            <a
                              href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${penguji.surat_tugas}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                            >
                              📄 Surat Tugas
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic mt-1">Belum ditugaskan</p>
                      )}
                    </div>
                    {penguji ? (
                      <span className="text-green-600 text-xl">✓</span>
                    ) : (
                      <span className="text-gray-300 text-xl">○</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center">
              <p className="text-gray-500">Belum ada penguji yang ditugaskan</p>
            </div>
          )}
        </div>

        {/* Warning if incomplete */}
        {pengujiCount < 4 && !isSelesai && (
          <div className="p-4 bg-yellow-50 border border-yellow-300 rounded">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">⚠️ Peringatan:</span> Jadwal masih berstatus DRAFT karena {4 - pengujiCount} penguji belum ditugaskan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}