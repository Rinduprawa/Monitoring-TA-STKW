// src/pages/admin/KaprodiForm.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import FormSelect from '../../components/common/FormSelect';

export default function KaprodiForm({ 
  kaprodiData, 
  onCancel, 
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    dosen_id: '',
  });

  const [dosenOptions, setDosenOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    if (kaprodiData) {
      fetchAvailableDosen(kaprodiData.prodi_id);
      
      setFormData({
        dosen_id: kaprodiData.dosen_id ? String(kaprodiData.dosen_id) : '',
      });
    }
  }, [kaprodiData]);

  const fetchAvailableDosen = async (prodiId) => {
    try {
      const response = await axios.get(`${API_URL}/kaprodi/dosen-available/${prodiId}`);
      
      // Include current kaprodi dosen if exists
      const options = response.data.map(dosen => ({
        value: String(dosen.id),
        label: `${dosen.nama} - ${dosen.nip}`
      }));

      // Add current assigned dosen if not in list
      if (kaprodiData?.dosen) {
        const currentDosenExists = options.some(opt => opt.value === String(kaprodiData.dosen_id));
        if (!currentDosenExists) {
          options.unshift({
            value: String(kaprodiData.dosen_id),
            label: `${kaprodiData.dosen.nama} - ${kaprodiData.dosen.nip} (Saat ini)`
          });
        }
      }

      setDosenOptions(options);
    } catch (error) {
      console.error('Error fetching dosen:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.dosen_id) {
      setErrors({ dosen_id: ['Dosen wajib dipilih'] });
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      await axios.put(`${API_URL}/kaprodi/${kaprodiData.id}`, {
        dosen_id: parseInt(formData.dosen_id)
      });
      
      alert('Kaprodi berhasil diperbarui');
      onSuccess();
    } catch (error) {
      console.error('Error updating kaprodi:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
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
        Edit Kepala Program Studi
      </h2>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        {/* Info Prodi (read-only) */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Program Studi
          </label>
          <input
            type="text"
            value={kaprodiData?.prodi?.nama_prodi || ''}
            disabled
            className="w-full px-3 py-2 border border-gray-300 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Dropdown Dosen */}
        <FormSelect
          label="Dosen"
          name="dosen_id"
          value={formData.dosen_id}
          onChange={handleChange}
          options={dosenOptions}
          placeholder="Pilih dosen"
          required
          error={errors.dosen_id?.[0]}
        />

        {/* Current Info */}
        {kaprodiData?.dosen && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-300 text-sm">
            <p className="font-medium">Kaprodi Saat Ini:</p>
            <p>{kaprodiData.dosen.nama} ({kaprodiData.dosen.nip})</p>
          </div>
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
            {loading ? 'Menyimpan...' : 'Perbarui'}
          </button>
        </div>
      </form>
    </div>
  );
}