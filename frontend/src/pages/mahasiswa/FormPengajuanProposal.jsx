// src/pages/mahasiswa/FormPengajuanProposal.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import FilePreviewModal from '../../components/modal/FilePreview';

export default function FormPengajuanProposal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    judul_ta: '',
    bentuk_ta: 'penelitian',
  });
  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });

  const fetchPengajuan = useCallback(async () => {
    try {
      const response = await api.get(`/pengajuan-proposal/${id}`);
      const data = response.data.data;
      
      setFormData({
        judul_ta: data.judul_ta,
        bentuk_ta: data.bentuk_ta,
      });
      
      if (data.file_proposal) {
        setExistingFile({
          id: data.id,
          filename: data.file_proposal.split('/').pop(),
          url: `http://localhost:8000/api/pengajuan-proposal/${data.id}/preview`
        });
      }
    } catch (error) {
      console.error('Failed to fetch pengajuan:', error);
      alert('Gagal memuat data pengajuan');
      navigate('/mahasiswa/pengajuan-proposal');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEdit) {
      fetchPengajuan();
    }
  }, [isEdit, fetchPengajuan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePreview = (fileId, fileName) => {
    const url = `http://localhost:8000/api/pengajuan-proposal/${fileId}/preview`;
    setPreviewModal({
      isOpen: true,
      fileUrl: url,
      fileName: fileName
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (errors.file_proposal) {
      setErrors(prev => ({ ...prev, file_proposal: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.judul_ta.trim()) {
      newErrors.judul_ta = 'Judul TA wajib diisi';
    }
    if (!isEdit && !file) {
      newErrors.file_proposal = 'File proposal wajib diupload';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('judul_ta', formData.judul_ta);
    formDataToSend.append('bentuk_ta', formData.bentuk_ta);
    if (file) {
      formDataToSend.append('file_proposal', file);
    }

    try {
      if (isEdit) {
        await api.post(`/pengajuan-proposal/${id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Pengajuan berhasil diperbarui');
      } else {
        await api.post('/pengajuan-proposal', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Pengajuan berhasil dibuat');
      }
      navigate('/mahasiswa/pengajuan-proposal');
    } catch (error) {
      console.error('Failed to submit:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || 'Gagal menyimpan pengajuan');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? 'Edit' : 'Formulir'} Pengajuan Proposal
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-6 max-w-3xl">
        <div className="space-y-6">
          {/* Judul TA */}
          <div>
            <label className="block mb-2 text-gray-800">
              Judul Tugas Akhir <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="judul_ta"
              value={formData.judul_ta}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan judul tugas akhir"
            />
            {errors.judul_ta && (
              <p className="text-red-600 text-sm mt-1">{errors.judul_ta}</p>
            )}
          </div>

          {/* Bentuk TA */}
          <div>
            <label className="block mb-2 text-gray-800">
              Bentuk Tugas Akhir <span className="text-red-600">*</span>
            </label>
            <select
              name="bentuk_ta"
              value={formData.bentuk_ta}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="penelitian">Penelitian</option>
              <option value="penciptaan">Penciptaan</option>
            </select>
          </div>

          {/* File Proposal */}
          <div>
            <label className="block mb-2 text-gray-800">
              File Proposal <span className="text-red-600">*</span>
            </label>
                        
            {/* Show existing file in edit mode */}
            {isEdit && existingFile && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-300 flex items-center justify-between rounded">
                  <span className="text-sm text-gray-600">
                    File sebelumnya: <span className="font-medium">{existingFile.filename}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePreview(existingFile.id, 'File Proposal')}
                    className="text-blue-600 hover:underline text-sm ml-4"
                  >
                    👁 Preview
                  </button>
                </div>
            )}

            
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {isEdit 
                ? 'Upload file baru untuk mengganti file sebelumnya' 
                : '*ekstensi yang diizinkan: pdf, doc, docx (max 5MB)'}
            </p>
            {errors.file_proposal && (
              <p className="text-red-600 text-sm mt-1">{errors.file_proposal}</p>
            )}
            {file && (
              <p className="text-green-600 text-sm mt-1">âœ“ {file.name}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-300">
          <button
            type="button"
            onClick={() => navigate('/mahasiswa/pengajuan-proposal')}
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
            {loading ? 'Menyimpan...' : 'Kirim Pengajuan'}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      <FilePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', fileName: '' })}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
      />
    </div>
  );
}
