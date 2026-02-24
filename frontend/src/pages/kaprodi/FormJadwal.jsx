// src/pages/kaprodi/FormJadwal.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import FormInput from '../../components/form/FormInput';
import FormSelect from '../../components/form/FormSelect';

export default function FormJadwal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    mahasiswa_id: '',
    jenis_ujian: '',
    tanggal: '',
    jam_mulai: '',
    jam_selesai: '',
  });
  
  const [hasPenugasan ] = useState(false); // Always false for now
  // const [hasPenugasan, setHasPenugasan] = useState(false); 
  const [initialJenisUjian, setInitialJenisUjian] = useState('');

  const [mahasiswaOptions, setMahasiswaOptions] = useState([]);
  const [jenisUjianOptions, setJenisUjianOptions] = useState([]);
  const [existingJenisUjian, setExistingJenisUjian] = useState([]);
  const [defaultJenisUjian, setDefaultJenisUjian] = useState('');
  const [penugasanInfo, setPenugasanInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [warning, setWarning] = useState('');

  const allJenisUjian = {
    penelitian: [
      { value: 'proposal', label: 'Proposal' },
      { value: 'uji_kelayakan_1', label: 'Uji Kelayakan 1' },
      { value: 'uji_kelayakan_2', label: 'Uji Kelayakan 2' },
      { value: 'sidang_skripsi', label: 'Sidang Skripsi' },
    ],
    penciptaan: [
      { value: 'proposal', label: 'Proposal' },
      { value: 'tes_tahap_1', label: 'Tes Tahap 1' },
      { value: 'tes_tahap_2', label: 'Tes Tahap 2' },
      { value: 'pergelaran', label: 'Pergelaran' },
      { value: 'sidang_komprehensif', label: 'Sidang Komprehensif' },
    ]
  };

  useEffect(() => {
    fetchMahasiswaOptions();
    if (isEdit) {
      fetchJadwal();
    }
  }, [id]);

  useEffect(() => {
    if (formData.mahasiswa_id && formData.jenis_ujian) {
      fetchPenugasanInfo();
    } else {
      setPenugasanInfo([]);
    }
  }, [formData.mahasiswa_id, formData.jenis_ujian]);

  const fetchPenugasanInfo = async () => {
    try {
      const response = await api.get('/kaprodi/penugasan-dosen/by-mahasiswa-ujian', {
        params: {
          mahasiswa_id: formData.mahasiswa_id,
          jenis_ujian: formData.jenis_ujian
        }
      });
      setPenugasanInfo(response.data.data);
    } catch (error) {
      console.error('Failed to fetch penugasan:', error);
      setPenugasanInfo([]);
    }
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

  const allPengujiJenis = ['penguji_struktural', 'penguji_ahli', 'penguji_pembimbing', 'penguji_stakeholder'];
  const assignedPenguji = penugasanInfo.map(p => p.jenis_penugasan);
  const missingPenguji = allPengujiJenis.filter(j => !assignedPenguji.includes(j));

  const fetchMahasiswaOptions = async () => {
    try {
      const response = await api.get('/kaprodi/mahasiswa-eligible');
      const options = response.data.data.map(mhs => ({
        value: mhs.id,
        label: `${mhs.nama} - ${mhs.nim}`,
        bentuk_ta: mhs.bentuk_ta
      }));
      setMahasiswaOptions(options);
    } catch (error) {
      console.error('Failed to fetch mahasiswa:', error);
    }
  };

  const fetchJadwal = async () => {
    try {
      const response = await api.get(`/kaprodi/jadwal-ujian/${id}`);
      const jadwal = response.data.data;
      
      setFormData({
        mahasiswa_id: String(jadwal.mahasiswa_id),
        jenis_ujian: jadwal.jenis_ujian,
        tanggal: jadwal.tanggal.split('T')[0], 
        jam_mulai: jadwal.jam_mulai,
        jam_selesai: jadwal.jam_selesai,
      });
      
      setInitialJenisUjian(jadwal.jenis_ujian); // ← Store initial value
      
      if (jadwal.mahasiswa?.bentuk_ta) {
        const allOptions = allJenisUjian[jadwal.mahasiswa.bentuk_ta] || [];
        
        // Fetch existing jenis ujian for this mahasiswa
        try {
          const nextResponse = await api.get(`/kaprodi/jadwal-ujian/next-ujian/${jadwal.mahasiswa_id}`);
          const { next_ujian, existing_jenis } = nextResponse.data.data;
          
          setDefaultJenisUjian(next_ujian || jadwal.jenis_ujian);
          setExistingJenisUjian(existing_jenis || []);
          
          // Apply disable logic: disable existing jenis EXCEPT the one being edited
          const optionsWithDisabled = allOptions.map(opt => ({
            ...opt,
            disabled: existing_jenis?.includes(opt.value) && opt.value !== jadwal.jenis_ujian
          }));
          
          setJenisUjianOptions(optionsWithDisabled);
        } catch (err) {
          setDefaultJenisUjian(jadwal.jenis_ujian);
          setJenisUjianOptions(allOptions);
        }
      }
    } catch (error) {
      console.error('Failed to fetch jadwal:', error);
      alert('Gagal memuat data jadwal');
      navigate('/kaprodi/jadwal-ujian');
    }
  };

  const handleMahasiswaChange = async (e, preselectedJenis = null) => {
    const mahasiswaId = e.target.value;
    setFormData({ ...formData, mahasiswa_id: mahasiswaId, jenis_ujian: preselectedJenis || '' });
    setWarning('');
    setDefaultJenisUjian('');
    setExistingJenisUjian([]); // ← Reset

    if (!mahasiswaId) {
      setJenisUjianOptions([]);
      return;
    }

    const mhs = mahasiswaOptions.find(m => m.value === parseInt(mahasiswaId));
    if (!mhs || !mhs.bentuk_ta) {
      alert('Mahasiswa belum memiliki bentuk TA');
      return;
    }

    try {
      const response = await api.get(`/kaprodi/jadwal-ujian/next-ujian/${mahasiswaId}`);
      const { next_ujian, existing_jenis } = response.data.data; // ← Get existing

      // Set options based on bentuk_ta
      const allOptions = allJenisUjian[mhs.bentuk_ta] || [];
      
      // Mark existing as disabled
      // In CREATE mode: disable all existing jenis
      // In EDIT mode: disable existing jenis EXCEPT the current one being edited
      const optionsWithDisabled = allOptions.map(opt => ({
        ...opt,
        disabled: existing_jenis?.includes(opt.value) && (!isEdit || opt.value !== initialJenisUjian)
      }));
      
      setJenisUjianOptions(optionsWithDisabled);
      setExistingJenisUjian(existing_jenis || []); // ← Store existing

      if (next_ujian && !preselectedJenis) {
        setDefaultJenisUjian(next_ujian);
        setFormData(prev => ({ ...prev, jenis_ujian: next_ujian }));
      }

    } catch (error) {
      console.error('Failed to get next ujian:', error);
    }
  };

  const handleJenisUjianChange = async (e) => {
    const jenisUjian = e.target.value;
    setFormData({ ...formData, jenis_ujian: jenisUjian });
    setWarning('');

    if (!formData.mahasiswa_id || !jenisUjian) return;

    // Only check if different from initial (for edit mode)
    if (isEdit && jenisUjian === initialJenisUjian) {
      return; // No warning for same value
    }

    try {
      const response = await api.get(
        `/kaprodi/jadwal-ujian/check-sequence/${formData.mahasiswa_id}/${jenisUjian}`,
        {
          params: { 
            exclude_current: isEdit ? initialJenisUjian : null
          }
        }
      );
      
      const { is_valid, message } = response.data;

      if (!is_valid) {
        setWarning(message);
      }
    } catch (error) {
      console.error('Failed to check sequence:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  // const isJenisChanged = isEdit 
  //   ? formData.jenis_ujian !== initialJenisUjian 
  //   : formData.jenis_ujian !== defaultJenisUjian;

  const isDraft = !hasPenugasan || (warning !== '');  const buttonText = loading 
    ? 'Menyimpan...' 
    : isDraft 
    ? 'Simpan Draft' 
    : 'Tambah Jadwal';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const payload = {
        mahasiswa_id: formData.mahasiswa_id,
        jenis_ujian: formData.jenis_ujian,
        tanggal: formData.tanggal,
        jam_mulai: formData.jam_mulai,
        jam_selesai: formData.jam_selesai,
        status_jadwal: isDraft ? 'draft' : 'terjadwal',
      };

      if (isEdit) {
        await api.put(`/kaprodi/jadwal-ujian/${id}`, payload);
        alert('Jadwal berhasil diperbarui');
      } else {
        await api.post('/kaprodi/jadwal-ujian', payload);
        alert(`Jadwal berhasil disimpan sebagai ${isDraft ? 'draft' : 'jadwal'}`);
      }

      navigate('/kaprodi/jadwal-ujian');
    } catch (error) {
      console.error('Failed to submit:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || 'Gagal menyimpan jadwal');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? 'Edit' : 'Formulir'} Jadwal Ujian Tugas Akhir
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-6 max-w-2xl">
        {/* 1. Mahasiswa FIRST */}
        <FormSelect
          label="Mahasiswa"
          name="mahasiswa_id"
          value={formData.mahasiswa_id}
          onChange={handleMahasiswaChange}
          options={mahasiswaOptions}
          placeholder="Pilih mahasiswa"
          required
          error={errors.mahasiswa_id?.[0]}
        />

        {/* 2. Jenis Ujian SECOND */}
        <FormSelect
          label="Jenis Ujian"
          name="jenis_ujian"
          value={formData.jenis_ujian}
          onChange={handleJenisUjianChange}
          options={jenisUjianOptions}
          placeholder="Pilih jenis ujian TA"
          required
          disabled={!formData.mahasiswa_id}
          error={errors.jenis_ujian?.[0]}
        />

        {/* ✅ NEW: Penugasan Info */}
        {formData.mahasiswa_id && formData.jenis_ujian && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded">
            <h3 className="font-semibold mb-3 text-gray-800">ℹ️ Informasi Penugasan</h3>
            
            {penugasanInfo.length > 0 ? (
              <div className="space-y-2">
                {allPengujiJenis.map(jenis => {
                  const penugasan = penugasanInfo.find(p => p.jenis_penugasan === jenis);
                  return (
                    <div key={jenis} className="flex items-center gap-2 text-sm">
                      {penugasan ? (
                        <>
                          <span className="text-green-600">✓</span>
                          <span className="font-medium">{getJenisLabel(jenis)}:</span>
                          <span className="text-gray-700">{penugasan.dosen?.nama}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-yellow-600">⚠️</span>
                          <span className="font-medium text-gray-500">{getJenisLabel(jenis)}:</span>
                          <span className="text-gray-400">Belum ada</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Belum ada penugasan dosen untuk ujian ini</p>
            )}

            {missingPenguji.length > 0 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-300 rounded">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Status:</span> DRAFT 
                  <span className="ml-1">({missingPenguji.length} penguji belum ditugaskan)</span>
                </p>
              </div>
            )}
            
            {missingPenguji.length === 0 && penugasanInfo.length === 4 && (
              <div className="mt-3 p-2 bg-green-50 border border-green-300 rounded">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Status:</span> Semua penguji sudah ditugaskan
                </p>
              </div>
            )}
          </div>
        )}

        {/* Warning Box */}
        {warning && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">⚠️ Peringatan:</span> {warning}
            </p>
          </div>
        )}
        
        {/* Tanggal */}
        <FormInput
          label="Tanggal"
          name="tanggal"
          type="date"
          value={formData.tanggal}
          onChange={handleChange}
          required
          error={errors.tanggal?.[0]}
        />

        {/* Jam */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Jam Mulai"
            name="jam_mulai"
            type="time"
            value={formData.jam_mulai}
            onChange={handleChange}
            required
            error={errors.jam_mulai?.[0]}
          />

          <FormInput
            label="Jam Selesai"
            name="jam_selesai"
            type="time"
            value={formData.jam_selesai}
            onChange={handleChange}
            error={errors.jam_selesai?.[0]}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/kaprodi/jadwal-ujian')}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            className={`px-6 py-2 text-white ${
              isDraft 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:bg-gray-400`}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : buttonText}
          </button>
        </div>
      </form>
    </div>
  );
}