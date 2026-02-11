// src/pages/mahasiswa/FormPendaftaranTA.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import FilePreviewModal from '../../components/modal/FilePreview';

export default function FormPendaftaranTA() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [files, setFiles] = useState({
    surat_permohonan: null,
    bukti_uang_gedung: null,
    kuitansi_spp: null,
    kuitansi_biaya_ta: null,
    khs: null,
    krs: null,
    transkrip: null,
    proyeksi_ta: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [existingFiles, setExistingFiles] = useState({}); // ← tambah ini

  const jenisBerkas = [
    { key: 'surat_permohonan', label: 'Surat Permohonan Memprogram Tugas Akhir', accept: '.jpg,.jpeg,.png,.pdf' },
    { key: 'bukti_uang_gedung', label: 'Bukti Uang Gedung Lunas', accept: '.jpg,.jpeg,.png,.pdf' },
    { key: 'kuitansi_spp', label: 'Kuitansi SPP', accept: '.jpg,.jpeg,.png,.pdf' },
    { key: 'kuitansi_biaya_ta', label: 'Kuitansi Biaya Tugas Akhir', accept: '.jpg,.jpeg,.png,.pdf' },
    { key: 'khs', label: 'KHS Semester Lalu', accept: '.jpg,.jpeg,.png,.pdf' },
    { key: 'krs', label: 'KRS Semester Ini', accept: '.jpg,.jpeg,.png,.pdf' },
    { key: 'transkrip', label: 'Transkrip Nilai', accept: '.jpg,.jpeg,.png,.pdf' },
    { key: 'proyeksi_ta', label: 'Dokumen Proyeksi Tugas Akhir', accept: '.doc,.docx,.pdf' },
  ];

  useEffect(() => {
    if (isEdit) {
      fetchPendaftaran();
    }
  }, [id]);

    const fetchPendaftaran = async () => {
    try {
        const response = await api.get(`/pendaftaran-ta/${id}`);
        const pendaftaran = response.data;   
             
        const existing = {};
        pendaftaran.berkas_pendaftaran?.forEach(berkas => {
        existing[berkas.jenis_berkas] = {
            id: berkas.id,
            filename: berkas.file_path.split('/').pop(),
            url: `http://localhost:8000/api/berkas-pendaftaran/${berkas.id}` // ← tanpa /download
        };
        });
        setExistingFiles(existing);
    } catch (error) {
        console.error('Failed to fetch pendaftaran:', error);
        alert('Gagal memuat data pendaftaran');
        navigate('/mahasiswa/pendaftaran-ta');
    }
    };
        

  const handleFileChange = (key, file) => {
    setFiles(prev => ({ ...prev, [key]: file }));
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });

  const handlePreview = (berkasId, fileName) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:8000/api/berkas-pendaftaran/${berkasId}?token=${token}`;
    
    setPreviewModal({
      isOpen: true,
      fileUrl: url,
      fileName: fileName
    });
  };

  const closePreview = () => {
    setPreviewModal({
      isOpen: false,
      fileUrl: '',
      fileName: ''
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate required files for create
    if (!isEdit) {
      const newErrors = {};
      jenisBerkas.forEach(({ key, label }) => {
        if (!files[key]) {
          newErrors[key] = `${label} wajib diisi`;
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    try {
      if (isEdit) {
        await api.post(`/pendaftaran-ta/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Pendaftaran berhasil diperbarui');
      } else {
        await api.post('/pendaftaran-ta', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Pendaftaran berhasil dibuat');
      }
      navigate('/mahasiswa/pendaftaran-ta');
    } catch (error) {
      console.error('Failed to submit:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || 'Gagal menyimpan pendaftaran');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? 'Edit' : 'Formulir'} Pendaftaran Tugas Akhir
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-6">
        <div className="space-y-6">
          {jenisBerkas.map(({ key, label, accept }) => (
<div key={key}>
  <label className="block mb-2 text-gray-800">
    {label} <span className="text-red-600">*</span>
  </label>
  
  {/* Show existing file in edit mode */}
  {isEdit && existingFiles[key] && (
    <div className="mb-2 p-2 bg-gray-50 border border-gray-300 flex items-center justify-between">
      <span className="text-sm text-gray-600">
        File sebelumnya: {existingFiles[key].filename}
      </span>
      <button
        type="button"
        onClick={() => handlePreview(existingFiles[key].id, label)}
        className="text-blue-600 hover:underline text-sm"
      >
        👁 Preview
      </button>
    </div>
  )}
  
  <input
    type="file"
    accept={accept}
    onChange={(e) => handleFileChange(key, e.target.files[0])}
    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <p className="text-xs text-gray-500 mt-1">
    {isEdit ? 'Upload file baru untuk mengganti file sebelumnya' : `*ekstensi yang diizinkan: ${accept.replace(/\./g, '').replace(/,/g, ', ')}`}
  </p>
  {errors[key] && (
    <p className="text-red-600 text-sm mt-1">{errors[key]}</p>
  )}
  {files[key] && (
    <p className="text-green-600 text-sm mt-1">✓ {files[key].name}</p>
  )}
</div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-300">
          <button
            type="button"
            onClick={() => navigate('/mahasiswa/pendaftaran-ta')}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Kirim Pendaftaran'}
          </button>
        </div>
          </form>
                {/* Tambah modal di akhir return */}
      <FilePreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
      />
    </div>
  );
}
