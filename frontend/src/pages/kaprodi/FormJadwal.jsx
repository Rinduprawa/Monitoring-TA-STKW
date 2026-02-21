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
    jenis_ujian: '',
    mahasiswa_id: '',
    tanggal_ujian: '',
    jam_mulai: '',
    jam_selesai: '',
    penguji: '', // dummy text field
  });

  const [mahasiswaOptions, setMahasiswaOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const jenisUjianOptions = [
    { value: 'proposal', label: 'Proposal' },
    { value: 'uji_kelayakan_1', label: 'Uji Kelayakan 1' },
    { value: 'uji_kelayakan_2', label: 'Uji Kelayakan 2' },
    { value: 'tes_tahap_1', label: 'Tes Tahap 1' },
    { value: 'tes_tahap_2', label: 'Tes Tahap 2' },
    { value: 'pergelaran', label: 'Pergelaran' },
    { value: 'sidang_skripsi', label: 'Sidang Skripsi' },
    { value: 'sidang_komprehensif', label: 'Sidang Komprehensif' },
  ];

  useEffect(() => {
    fetchMahasiswaOptions();
    if (isEdit) {
      fetchJadwal();
    }
  }, [id]);

  const fetchMahasiswaOptions = async () => {
    try {
      const response = await api.get('/kaprodi/mahasiswa-eligible'); // mahasiswa dengan proposal disetujui
      const options = response.data.data.map(mhs => ({
        value: mhs.id,
        label: `${mhs.nama} - ${mhs.nim}`
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
        jenis_ujian: jadwal.jenis_ujian,
        mahasiswa_id: jadwal.mahasiswa_id,
        tanggal_ujian: jadwal.tanggal_ujian,
        jam_mulai: jadwal.jam_mulai,
        jam_selesai: jadwal.jam_selesai,
        penguji: jadwal.penguji?.map(p => p.nama).join(', ') || '',
      });
    } catch (error) {
      console.error('Failed to fetch jadwal:', error);
      alert('Gagal memuat data jadwal');
      navigate('/kaprodi/jadwal-ujian');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const payload = {
        jenis_ujian: formData.jenis_ujian,
        mahasiswa_id: formData.mahasiswa_id,
        tanggal_ujian: formData.tanggal_ujian,
        jam_mulai: formData.jam_mulai,
        jam_selesai: formData.jam_selesai,
        // penguji skip dulu (dummy)
      };

      if (isEdit) {
        await api.put(`/kaprodi/jadwal-ujian/${id}`, payload);
        alert('Jadwal berhasil diperbarui');
      } else {
        await api.post('/kaprodi/jadwal-ujian', payload);
        alert('Jadwal berhasil ditambahkan');
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
        Formulir Jadwal Ujian Tugas Akhir
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-6 max-w-2xl">
        <FormSelect
          label="Jenis Ujian"
          name="jenis_ujian"
          value={formData.jenis_ujian}
          onChange={handleChange}
          options={jenisUjianOptions}
          placeholder="Pilih jenis ujian TA"
          required
          error={errors.jenis_ujian?.[0]}
        />

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

        <FormInput
          label="Dosen Penguji"
          name="penguji"
          value={formData.penguji}
          onChange={handleChange}
          placeholder="Belum ada dosen penguji (dummy field)"
          disabled
        />

        <FormInput
          label="Tanggal"
          name="tanggal_ujian"
          type="date"
          value={formData.tanggal_ujian}
          onChange={handleChange}
          required
          error={errors.tanggal_ujian?.[0]}
        />

        <FormInput
          label="Jam"
          name="jam_mulai"
          type="time"
          value={formData.jam_mulai}
          onChange={handleChange}
          placeholder="Jam pelaksanaan"
          required
          error={errors.jam_mulai?.[0]}
        />

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
            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Tambahkan'}
          </button>
        </div>
      </form>
    </div>
  );
}