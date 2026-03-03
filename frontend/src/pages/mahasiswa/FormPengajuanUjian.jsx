// src/pages/FormPengajuanUjian.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import FilePreview from '../../components/modal/FilePreview';

export default function FormPengajuanUjian() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    jenis_ujian: '',
    file_bukti_kelayakan: null,
  });
  const [existingFile, setExistingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [bentukTa, setBentukTa] = useState(null); // ✅ Added
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });

  useEffect(() => {
    fetchBentukTa(); // ✅ Fetch bentuk_ta first
    if (isEdit) {
      fetchPengajuan();
    }
  }, [isEdit]);

  // ✅ Get bentuk_ta from approved proposal
  const fetchBentukTa = async () => {
    try {
      const response = await api.get('/pengajuan-proposal');
      const approvedProposal = response.data.data.find(
        p => p.status === 'disetujui'
      );
      
      if (approvedProposal) {
        setBentukTa(approvedProposal.bentuk_ta);
      }
    } catch (error) {
      console.error('Failed to fetch bentuk TA:', error);
    }
  };

  const fetchPengajuan = async () => {
    try {
      const response = await api.get(`/pengajuan-ujian/${id}`);
      const data = response.data.data;
      
      setFormData({
        jenis_ujian: data.jenis_ujian,
        file_bukti_kelayakan: null,
      });
      setExistingFile(data.file_bukti_kelayakan);
      setIsDisabled(data.status !== 'diproses_pembimbing');
    } catch (error) {
      console.error('Failed to fetch pengajuan:', error);
      alert('Gagal mengambil data pengajuan');
      navigate('/mahasiswa/pengajuan-ujian');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file_bukti_kelayakan: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.jenis_ujian) {
      alert('Jenis ujian harus diisi');
      return;
    }

    if (!isEdit && !formData.file_bukti_kelayakan) {
      alert('File bukti kelayakan harus diupload');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('jenis_ujian', formData.jenis_ujian);
      
      if (formData.file_bukti_kelayakan) {
        payload.append('file_bukti_kelayakan', formData.file_bukti_kelayakan);
      }

      if (isEdit) {
        await api.post(`/pengajuan-ujian/${id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Pengajuan ujian berhasil diperbarui');
      } else {
        await api.post('/pengajuan-ujian', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Pengajuan ujian berhasil diajukan');
      }

      navigate('/mahasiswa/pengajuan-ujian');
    } catch (error) {
      console.error('Failed to submit:', error);
      
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        alert(errors.join('\n'));
      } else {
        alert(error.response?.data?.message || 'Gagal menyimpan pengajuan');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter options based on bentuk_ta
  const getJenisUjianOptions = () => {
    const allOptions = [
      { value: 'uji_kelayakan_1', label: 'Kelayakan 1', bentuk: 'penelitian' },
      { value: 'tes_tahap_1', label: 'Tahap 1', bentuk: 'penciptaan' },
      { value: 'uji_kelayakan_2', label: 'Kelayakan 2', bentuk: 'penelitian' },
      { value: 'tes_tahap_2', label: 'Tahap 2', bentuk: 'penciptaan' },
      { value: 'pergelaran', label: 'Pergelaran', bentuk: 'penciptaan' },
      { value: 'sidang_skripsi', label: 'Sidang Skripsi', bentuk: 'penelitian' },
      { value: 'sidang_komprehensif', label: 'Sidang Komprehensif', bentuk: 'penciptaan' },
    ];

    if (!bentukTa) return allOptions;

    return allOptions.filter(opt => 
      opt.bentuk === 'both' || opt.bentuk === bentukTa
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate('/mahasiswa/pengajuan-ujian')}
          className="text-2xl"
        >
          ←
        </button>
        <h1 className="text-2xl font-semibold">
          {isEdit ? (isDisabled ? 'Detail Pengajuan Ujian' : 'Edit Pengajuan Ujian') : 'Tambah Pengajuan Ujian'}
        </h1>
      </div>

      {isDisabled && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-600 text-yellow-800">
          <p className="font-medium">Pengajuan ini sudah diproses dan tidak dapat diubah</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        {/* Jenis Ujian */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Jenis Ujian <span className="text-red-600">*</span>
          </label>
          <select
            name="jenis_ujian"
            value={formData.jenis_ujian}
            onChange={handleChange}
            disabled={isDisabled}
            className="w-full p-2 border border-gray-300 disabled:bg-gray-100"
            required
          >
            <option value="">Pilih Jenis Ujian</option>
            {getJenisUjianOptions().map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* File Bukti Kelayakan */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            File Bukti Kelayakan <span className="text-red-600">*</span>
          </label>
          
          {existingFile && (
            <div className="mb-2 p-3 bg-gray-50 border border-gray-300">
              <p className="text-sm text-gray-600 mb-2">File saat ini:</p>
              <button
                type="button"
                onClick={() => setPreviewModal({
                  isOpen: true,
                  fileUrl: `/pengajuan-ujian/${id}/preview-bukti?t=${Date.now()}`, // ✅ Use API endpoint
                  fileName: 'Bukti Kelayakan'
                })}
                className="text-blue-600 hover:underline"
              >
                📄 {existingFile.split('/').pop()}
              </button>
            </div>
          )}

          <input
            type="file"
            onChange={handleFileChange}
            disabled={isDisabled}
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full p-2 border border-gray-300 disabled:bg-gray-100"
            required={!isEdit && !existingFile}
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: PDF, JPG, JPEG, PNG (Max: 5MB)
            {isEdit && ' - Kosongkan jika tidak ingin mengubah file'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/mahasiswa/pengajuan-ujian')}
            className="px-6 py-2 border border-gray-800"
          >
            {isDisabled ? 'Kembali' : 'Batal'}
          </button>
          
          {!isDisabled && (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Ajukan'}
            </button>
          )}
        </div>
      </form>

        {/* File Preview Modal */}
        <FilePreview
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', fileName: '' })}
          fileUrl={previewModal.fileUrl}
          fileName={previewModal.fileName}
        />
    </div>
  );
}