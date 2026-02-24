// src/pages/kaprodi/FormPenugasan.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import FormSelect from '../../components/form/FormSelect';

export default function FormPenugasan() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    kategori: '',
    jenis_penugasan: '',
    jenis_ujian: '',
    dosen_id: '',
    mahasiswa_id: '',
    surat_tugas: null,
  });

  const [dosenOptions, setDosenOptions] = useState([]);
  const [mahasiswaOptions, setMahasiswaOptions] = useState([]);
  const [jenisPenugasanOptions, setJenisPenugasanOptions] = useState([]);
  const [jenisUjianOptions, setJenisUjianOptions] = useState([]);
  const [existingSuratTugas, setExistingSuratTugas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const kategoriOptions = [
    { value: 'pembimbing', label: 'Pembimbing' },
    { value: 'penguji', label: 'Penguji' },
  ];

  const jenisPembimbingOptions = [
    { value: 'pembimbing_1', label: 'Pembimbing 1' },
    { value: 'pembimbing_2', label: 'Pembimbing 2' },
  ];

  const jenisPengujiOptions = [
    { value: 'penguji_struktural', label: 'Penguji Struktural' },
    { value: 'penguji_ahli', label: 'Penguji Ahli' },
    { value: 'penguji_pembimbing', label: 'Penguji Pembimbing' },
    { value: 'penguji_stakeholder', label: 'Penguji Stakeholder' },
  ];

  const allJenisUjianOptions = [
    { value: 'proposal', label: 'Proposal' },
    { value: 'uji_kelayakan_1', label: 'Kelayakan 1' },
    { value: 'tes_tahap_1', label: 'Tahap 1' },
    { value: 'uji_kelayakan_2', label: 'Kelayakan 2' },
    { value: 'tes_tahap_2', label: 'Tahap 2' },
    { value: 'pergelaran', label: 'Pergelaran' },
    { value: 'sidang_skripsi', label: 'Sidang Skripsi' },
    { value: 'sidang_komprehensif', label: 'Sidang Komprehensif' },
  ];

  // Fetch dosen & mahasiswa on mount (always show)
  useEffect(() => {
    fetchDosen();
    if (isEdit) {
      fetchPenugasan();
    }
  }, [id]);

  const fetchPenugasan = async () => {
    try {
      const response = await api.get(`/kaprodi/penugasan-dosen/${id}`);
      const { penugasan } = response.data.data;
      
      // Determine kategori from jenis_penugasan
      const kategori = ['pembimbing_1', 'pembimbing_2'].includes(penugasan.jenis_penugasan) 
        ? 'pembimbing' 
        : 'penguji';
      
      setFormData({
        kategori: kategori,
        jenis_penugasan: penugasan.jenis_penugasan,
        jenis_ujian: penugasan.jenis_ujian || '',
        dosen_id: String(penugasan.dosen_id),
        mahasiswa_id: String(penugasan.mahasiswa_id),
        surat_tugas: null,
      });
      
      setExistingSuratTugas(penugasan.file_surat_tugas);
      
      // Set options based on kategori
      if (kategori === 'pembimbing') {
        setJenisPenugasanOptions(jenisPembimbingOptions);
      } else {
        setJenisPenugasanOptions(jenisPengujiOptions);
        setJenisUjianOptions(allJenisUjianOptions);
      }
      
      // Fetch mahasiswa options
      await fetchMahasiswa(penugasan.jenis_penugasan, penugasan.jenis_ujian);
      
    } catch (error) {
      console.error('Failed to fetch penugasan:', error);
      alert('Gagal memuat data penugasan');
      navigate('/kaprodi/penugasan-dosen');
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

  // Cascade 1: Kategori change
  const handleKategoriChange = (e) => {
    const kategori = e.target.value;
    
    setFormData({
      ...formData,
      kategori: kategori,
      jenis_penugasan: '',
      jenis_ujian: '',
    });

    // Set jenis penugasan options
    if (kategori === 'pembimbing') {
      setJenisPenugasanOptions(jenisPembimbingOptions);
      setJenisUjianOptions([]); // Clear ujian for pembimbing
    } else if (kategori === 'penguji') {
      setJenisPenugasanOptions(jenisPengujiOptions);
      setJenisUjianOptions(allJenisUjianOptions); // Show ujian for penguji
    } else {
      setJenisPenugasanOptions([]);
      setJenisUjianOptions([]);
    }

    setMahasiswaOptions([]); // Clear mahasiswa list
  };

  // Cascade 2: Jenis Penugasan change → Fetch mahasiswa
  const handleJenisPenugasanChange = (e) => {
    const jenisPenugasan = e.target.value;
    
    setFormData({
      ...formData,
      jenis_penugasan: jenisPenugasan,
    });

    // Fetch mahasiswa based on jenis_penugasan (and jenis_ujian if penguji)
    if (formData.kategori === 'pembimbing') {
      fetchMahasiswa(jenisPenugasan, null);
    } else if (formData.kategori === 'penguji' && formData.jenis_ujian) {
      fetchMahasiswa(jenisPenugasan, formData.jenis_ujian);
    }
  };

  // Cascade 3: Jenis Ujian change → Fetch mahasiswa (only for penguji)
  const handleJenisUjianChange = (e) => {
    const jenisUjian = e.target.value;
    
    setFormData({
      ...formData,
      jenis_ujian: jenisUjian,
    });

    // Fetch mahasiswa if jenis_penugasan already selected
    if (formData.jenis_penugasan) {
      fetchMahasiswa(formData.jenis_penugasan, jenisUjian);
    }
  };

  const fetchMahasiswa = async (jenisPenugasan, jenisUjian) => {
    try {
      const response = await api.get('/kaprodi/penugasan-dosen/mahasiswa-available', {
        params: { 
          jenis_penugasan: jenisPenugasan,
          jenis_ujian: jenisUjian || undefined,
          dosen_id: formData.dosen_id || undefined // ← Pass dosen_id
        }
      });
      setMahasiswaOptions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch mahasiswa:', error);
    }
  };


  const handleDosenChange = (e) => {
    const dosenId = e.target.value;
    
    setFormData({
      ...formData,
      dosen_id: dosenId,
    });

    // Refetch mahasiswa if jenis_penugasan already selected
    if (formData.jenis_penugasan) {
      // Temporarily update formData for fetch
      const tempFormData = { ...formData, dosen_id: dosenId };
      
      if (formData.kategori === 'pembimbing') {
        fetchMahasiswaWithDosen(formData.jenis_penugasan, null, dosenId);
      } else if (formData.kategori === 'penguji' && formData.jenis_ujian) {
        fetchMahasiswaWithDosen(formData.jenis_penugasan, formData.jenis_ujian, dosenId);
      }
    }
  };

  const fetchMahasiswaWithDosen = async (jenisPenugasan, jenisUjian, dosenId) => {
    try {
      const response = await api.get('/kaprodi/penugasan-dosen/mahasiswa-available', {
        params: { 
          jenis_penugasan: jenisPenugasan,
          jenis_ujian: jenisUjian || undefined,
          dosen_id: dosenId || undefined
        }
      });
      setMahasiswaOptions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch mahasiswa:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      surat_tugas: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const payload = new FormData();
      payload.append('kategori', formData.kategori);
      payload.append('jenis_penugasan', formData.jenis_penugasan);
      if (formData.jenis_ujian) {
        payload.append('jenis_ujian', formData.jenis_ujian);
      }
      payload.append('dosen_id', formData.dosen_id);
      payload.append('mahasiswa_id', formData.mahasiswa_id);
      if (formData.surat_tugas) {
        payload.append('surat_tugas', formData.surat_tugas);
      }

      if (isEdit) {
        await api.post(`/kaprodi/penugasan-dosen/${id}`, payload, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'X-HTTP-Method-Override': 'PUT' // Laravel multipart PUT workaround
          }
        });
        alert('Penugasan berhasil diperbarui');
      } else {
        await api.post('/kaprodi/penugasan-dosen', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Penugasan berhasil ditambahkan');
      }

      navigate('/kaprodi/penugasan-dosen');
    } catch (error) {
      console.error('Failed to submit:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || 'Gagal menyimpan penugasan');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? 'Edit' : 'Formulir'} Penugasan Dosen
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-6 max-w-2xl">
        {/* 1. Jenis Penugasan (Kategori) - ALWAYS SHOW */}
        <FormSelect
          label="Jenis Penugasan"
          name="kategori"
          value={formData.kategori}
          onChange={handleKategoriChange}
          options={kategoriOptions}
          placeholder="Pilih penugasan (pembimbing / penguji)"
          required
          error={errors.kategori?.[0]}
        />

        {/* 2. Jenis Pembimbing / Penguji - SHOW when kategori selected */}
        {formData.kategori && (
          <FormSelect
            label={formData.kategori === 'pembimbing' ? 'Jenis Pembimbing' : 'Jenis Penguji'}
            name="jenis_penugasan"
            value={formData.jenis_penugasan}
            onChange={handleJenisPenugasanChange}
            options={jenisPenugasanOptions}
            placeholder={`Pilih jenis ${formData.kategori}`}
            required
            error={errors.jenis_penugasan?.[0]}
          />
        )}

        {/* 3. Jenis Ujian - SHOW for penguji only */}
        {formData.kategori === 'penguji' && (
          <FormSelect
            label="Jenis Ujian"
            name="jenis_ujian"
            value={formData.jenis_ujian}
            onChange={handleJenisUjianChange}
            options={jenisUjianOptions}
            placeholder="Pilih jenis ujian TA"
            required
            error={errors.jenis_ujian?.[0]}
          />
        )}

        {/* 4. Dosen - ALWAYS SHOW */}
        <FormSelect
          label="Dosen"
          name="dosen_id"
          value={formData.dosen_id}
          onChange={handleDosenChange} // ← Use new handler
          options={dosenOptions}
          placeholder="Pilih dosen"
          required
          error={errors.dosen_id?.[0]}
        />

        {/* 5. Mahasiswa - ALWAYS SHOW */}
        <FormSelect
          label="Mahasiswa"
          name="mahasiswa_id"
          value={formData.mahasiswa_id}
          onChange={handleChange}
          options={mahasiswaOptions}
          placeholder="Pilih mahasiswa"
          required
          error={errors.mahasiswa_id?.[0]}
        />

        {/* 6. Surat Tugas - ALWAYS SHOW */}
        <div className="mb-4">
          <label className="block mb-2 text-sm text-gray-800">
            Surat Tugas <span className="text-red-500">*</span>
          </label>
          
          {isEdit && existingSuratTugas && (
            <div className="mb-2 p-2 bg-gray-50 border border-gray-300">
              <p className="text-sm text-gray-700">File saat ini:</p>
              <a 
                target="_blank"
                className="text-blue-600 text-sm"
              >
                📄 {existingSuratTugas.split('/').pop()}
              </a>
              <p className="text-xs text-gray-500 mt-1">Upload file baru untuk mengganti</p>
            </div>
          )}
          
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300"
            required={!isEdit && !existingSuratTugas}
          />
          <p className="text-xs text-gray-500 mt-1">
            *ekstensi yang diizinkan: pdf
          </p>
          {errors.surat_tugas?.[0] && (
            <p className="text-red-600 text-sm mt-1">{errors.surat_tugas[0]}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/kaprodi/penugasan-dosen')}
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
            {loading ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Tambahkan'}
          </button>
        </div>
      </form>
    </div>
  );
}