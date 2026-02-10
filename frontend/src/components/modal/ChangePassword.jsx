import { useState } from 'react';
import axios from 'axios';
import FormInput from '../form/FormInput';

export default function ChangePassword({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

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
  
  // Client validation
  const newErrors = {};
  
  if (!formData.current_password) {
    newErrors.current_password = ['Password lama wajib diisi'];
  }
  
  if (!formData.new_password) {
    newErrors.new_password = ['Password baru wajib diisi'];
  } else if (formData.new_password.length < 8) {
    newErrors.new_password = ['Password minimal 8 karakter'];
  } else if (formData.new_password === formData.current_password) {
    newErrors.new_password = ['Password baru tidak boleh sama dengan password lama'];
  }
  
  if (formData.new_password !== formData.new_password_confirmation) {
    newErrors.new_password_confirmation = ['Konfirmasi password tidak cocok'];
  }
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  
  setLoading(true);

  try {
    await axios.post('http://localhost:8000/api/change-password', {
      current_password: formData.current_password,
      new_password: formData.new_password,
      new_password_confirmation: formData.new_password_confirmation,
    });
    
    alert('Password berhasil diubah');
    setFormData({
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    });
    onClose();
  } catch (error) {
    console.error('Error changing password:', error);
    
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white max-w-md w-full mx-4">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Ganti Password</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <FormInput
            label="Password Lama"
            name="current_password"
            type="password"
            value={formData.current_password}
            onChange={handleChange}
            placeholder="Masukkan password lama"
            required
            error={errors.current_password?.[0]}
          />

          <FormInput
            label="Password Baru"
            name="new_password"
            type="password"
            value={formData.new_password}
            onChange={handleChange}
            placeholder="Minimal 8 karakter"
            required
            error={errors.new_password?.[0]}
          />

          <FormInput
            label="Konfirmasi Password Baru"
            name="new_password_confirmation"
            type="password"
            value={formData.new_password_confirmation}
            onChange={handleChange}
            placeholder="Ulangi password baru"
            required
            error={errors.new_password_confirmation?.[0]}
          />

          <div className="flex justify-end gap-3 mt-6 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}