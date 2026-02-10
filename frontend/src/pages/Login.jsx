import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/common/FormInput';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(identifier, password);      
      switch (userData.role) {
        case 'mahasiswa':
          navigate('/mahasiswa/dashboard');
          break;
        case 'dosen':
          navigate('/dosen/dashboard');
          break;
        case 'kaprodi':
          navigate('/kaprodi/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">

        {/* Logo/Icon placeholder */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 border-2 border-gray-300 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-2">
          Sistem Monitoring Tugas Akhir
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Silakan masuk ke sistem
        </p>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <FormInput
            label="ID Pengguna"
            name="identifier"
            placeholder="Masukkan NIM/NIP/Email yang Terdaftar"
            onChange={(e) => setIdentifier(e.target.value)}
            required
            disabled={loading}
          />
            
          <FormInput
            type='password'
            label="PIN"
            name="password"
            placeholder="Masukkan PIN Anda"
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          {/* Lupa ID / PIN */}
          <div className="text-right mb-6">
            <a href="https://wa.me/" target="_blank" className="text-sm text-blue-600 hover:text-blue-800">
              Lupa ID / PIN?
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
