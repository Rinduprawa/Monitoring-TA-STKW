// src/components/modal/AssignPenguji.jsx

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ModalAssignPenguji({ isOpen, jadwal, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    jenis_penugasan: '',
    dosen_id: '',
    surat_tugas: null,
  });

  const [dosenOptions, setDosenOptions] = useState([]);
  const [jenisPengujiOptions, setJenisPengujiOptions] = useState([]);
  const [existingPenguji, setExistingPenguji] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const allJenisPenguji = [
    { value: 'penguji_struktural', label: 'Penguji Struktural' },
    { value: 'penguji_ahli', label: 'Penguji Ahli' },
    { value: 'penguji_pembimbing', label: 'Penguji Pembimbing' },
    { value: 'penguji_stakeholder', label: 'Penguji Stakeholder' },
  ];

  useEffect(() => {
    if (isOpen && jadwal) {
      fetchExistingPenguji();
      fetchDosen();
    } else {
      // Reset form when closed
      setFormData({
        jenis_penugasan: '',
        dosen_id: '',
        surat_tugas: null,
      });
      setErrors({});
    }
  }, [isOpen, jadwal]);

  const fetchExistingPenguji = async () => {
    try {
      const response = await api.get('/kaprodi/penugasan-dosen/by-mahasiswa-ujian', {
        params: {
          mahasiswa_id: jadwal.mahasiswa_id,
          jenis_ujian: jadwal.jenis_ujian
        }
      });
      
      const existing = response.data.data;
      setExistingPenguji(existing);
      
      // Filter out already assigned jenis
      const assignedJenis = existing.map(p => p.jenis_penugasan);
      const available = allJenisPenguji.map(j => ({
        ...j,
        disabled: assignedJenis.includes(j.value)
      }));
      
      setJenisPengujiOptions(available);
    } catch (error) {
      console.error('Failed to fetch existing penguji:', error);
      setExistingPenguji([]);
      setJenisPengujiOptions(allJenisPenguji);
    }
  };

  const fetchDosen = async () => {
    try {
      const response = await api.get('/kaprodi/penugasan-dosen/dosen-available');
      setDosenOptions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dosen:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, surat_tugas: e.target.files[0] });
    if (errors.surat_tugas) {
      setErrors({ ...errors, surat_tugas: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.jenis_penugasan || !formData.dosen_id) {
      alert('Pilih jenis penguji dan dosen');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload = new FormData();
      payload.append('kategori', 'penguji');
      payload.append('jenis_penugasan', formData.jenis_penugasan);
      payload.append('jenis_ujian', jadwal.jenis_ujian);
      payload.append('dosen_id', formData.dosen_id);
      payload.append('mahasiswa_id', jadwal.mahasiswa_id);
      
      if (formData.surat_tugas) {
        payload.append('surat_tugas', formData.surat_tugas);
      }

      await api.post('/kaprodi/penugasan-dosen', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Penguji berhasil ditambahkan');
      onSuccess();
    } catch (error) {
      console.error('Failed to assign penguji:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || 'Gagal menambahkan penguji');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !jadwal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">Tambah Penguji</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Mahasiswa (Read-only) */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-800">Mahasiswa</label>
            <input
              type="text"
              value={`${jadwal.mahasiswa?.nama} - ${jadwal.mahasiswa?.nim}`}
              disabled
              className="w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-700"
            />
          </div>

          {/* Jenis Ujian (Read-only) */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-800">Jenis Ujian</label>
            <input
              type="text"
              value={jadwal.jenis_ujian?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              disabled
              className="w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-700"
            />
          </div>

          {/* Existing Penguji Info */}
          {existingPenguji.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded">
              <p className="text-sm font-medium text-blue-800 mb-2">Penguji sudah ditugaskan:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                {existingPenguji.map(p => (
                  <li key={p.id}>
                    ✓ {allJenisPenguji.find(j => j.value === p.jenis_penugasan)?.label}: {p.dosen?.nama}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Jenis Penguji */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-800">
              Jenis Penguji <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_penugasan"
              value={formData.jenis_penugasan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
              required
            >
              <option value="">Pilih jenis penguji</option>
              {jenisPengujiOptions.map(opt => (
                <option 
                  key={opt.value} 
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label} {opt.disabled ? '(Sudah ditugaskan)' : ''}
                </option>
              ))}
            </select>
            {errors.jenis_penugasan && (
              <p className="text-red-600 text-sm mt-1">{errors.jenis_penugasan[0]}</p>
            )}
          </div>

          {/* Dosen */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-800">
              Dosen <span className="text-red-500">*</span>
            </label>
            <select
              name="dosen_id"
              value={formData.dosen_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
              required
            >
              <option value="">Pilih dosen</option>
              {dosenOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.dosen_id && (
              <p className="text-red-600 text-sm mt-1">{errors.dosen_id[0]}</p>
            )}
          </div>

          {/* Surat Tugas */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-800">
              Surat Tugas
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">*ekstensi yang diizinkan: pdf</p>
            {errors.surat_tugas && (
              <p className="text-red-600 text-sm mt-1">{errors.surat_tugas[0]}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Menyimpan...' : 'Tambahkan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}