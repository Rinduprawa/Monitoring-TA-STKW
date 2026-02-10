import { useState, useEffect } from 'react';
import axios from 'axios';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';

export default function UserForm({ 
  mode, 
  userData, 
  activeTab, 
  onCancel, 
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    nip: '',
    prodi_id: '',
    email: '',
    jk: '',
    password: 'password1234',
  });

  const [prodiOptions, setProdiOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchProdi();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && userData) {
      console.log('Edit mode - userData:', userData); // Debug
      
      setFormData({
        nama: userData.nama || '',
        nim: userData.nim || '',
        nip: userData.nip || '',
        prodi_id: String(userData.prodi_id) || '', // Convert to string
        email: userData.user?.email || '',
        jk: userData.jenis_kelamin || '',
        password: '',
      });
    }
  }, [mode, userData]);

  const fetchProdi = async () => {
    try {
      const response = await axios.get(`${API_URL}/prodi`);
      const options = response.data.map(prodi => ({
        value: String(prodi.id), // Convert to string
        label: prodi.nama_prodi
      }));
      setProdiOptions(options);
    } catch (error) {
      console.error('Error fetching prodi:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const newErrors = {};
    
    if (!formData.nama.trim()) {
      newErrors.nama = ['Nama lengkap wajib diisi'];
    }
    
    if (activeTab === 'mahasiswa' && !formData.nim.trim()) {
      newErrors.nim = ['NIM wajib diisi'];
    }
    
    if (activeTab !== 'mahasiswa' && !formData.nip.trim()) {
      newErrors.nip = ['NIP/NIDN wajib diisi'];
    }
    
    if (!formData.prodi_id) {
      newErrors.prodi_id = ['Program studi wajib dipilih'];
    }
    
    if (!formData.email.trim()) {
      newErrors.email = ['Email wajib diisi'];
    }
    
    if (activeTab === 'mahasiswa' && !formData.jk) {
      newErrors.jk = ['Jenis kelamin wajib dipilih'];
    }
    
    if (mode === 'create' && !formData.password.trim()) {
      newErrors.password = ['Password wajib diisi'];
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to error
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      const payload = {
        nama: formData.nama,
        prodi_id: parseInt(formData.prodi_id), // Convert back to number
        email: formData.email,
      };

      if (activeTab === 'mahasiswa') {
        payload.nim = formData.nim;
        payload.jk = formData.jk;
      } else {
        payload.nip = formData.nip;
      }

      if (mode === 'create') {
        payload.password = formData.password;
      }

      if (mode === 'create') {
        await axios.post(`${API_URL}/${activeTab}`, payload);
        alert('Pengguna berhasil ditambahkan');
      } else {
        await axios.put(`${API_URL}/${activeTab}/${userData.id}`, payload);
        alert('Pengguna berhasil diperbarui');
      }

      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(error.response?.data?.message || 'Terjadi kesalahan');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div>
                    <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
      <h2 className="text-2xl font-medium mb-6">
        {mode === 'create' ? 'Tambah' : 'Edit'} Pengguna Baru
      </h2>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-6 p-4 border border-red-500 bg-red-50 rounded">
          <p className="font-semibold text-red-700 mb-2">Terdapat kesalahan:</p>
          <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
            {Object.entries(errors).map(([field, messages]) => (
              <li key={field}>
                <span className="font-medium">{field}:</span> {Array.isArray(messages) ? messages[0] : messages}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <FormInput
          label="Nama Lengkap"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          placeholder="Masukkan nama lengkap pengguna"
          required
          error={errors.nama?.[0]}
        />

        <FormInput
          label={activeTab === 'mahasiswa' ? 'NIM' : 'NIP / NIDN'}
          name={activeTab === 'mahasiswa' ? 'nim' : 'nip'}
          value={activeTab === 'mahasiswa' ? formData.nim : formData.nip}
          onChange={handleChange}
          placeholder="Masukkan nomor induk pengguna"
          required
          error={errors.nim?.[0] || errors.nip?.[0]}
        />

        <FormSelect
          label="Program Studi"
          name="prodi_id"
          value={formData.prodi_id}
          onChange={handleChange}
          options={prodiOptions}
          placeholder="Pilih program studi"
          required
          error={errors.prodi_id?.[0]}
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Masukkan email pengguna"
          required
          error={errors.email?.[0]}
        />

        {mode === 'create' && (
          <FormInput
            label="Password"
            name="password"
            type="text"
            value={formData.password}
            onChange={handleChange}
            placeholder="Masukkan password"
            required
            error={errors.password?.[0]}
          />
        )}

        {activeTab === 'mahasiswa' && (
          <FormSelect
            label="Jenis Kelamin"
            name="jk"
            value={formData.jk}
            onChange={handleChange}
            options={[
              { value: 'L', label: 'Laki-laki' },
              { value: 'P', label: 'Perempuan' }
            ]}
            placeholder="Pilih jenis kelamin"
            required
            error={errors.jk?.[0]}
          />
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-gray-800 hover:bg-gray-800 hover:text-white disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : mode === 'create' ? 'Tambahkan' : 'Perbarui'}
          </button>
        </div>
      </form>
    </div>
  );
}