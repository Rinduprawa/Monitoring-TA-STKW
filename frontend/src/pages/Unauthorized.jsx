import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    // Redirect ke dashboard sesuai role
    switch (user?.role) {
      case 'mahasiswa':
        navigate('/mahasiswa');
        break;
      case 'dosen':
        navigate('/dosen');
        break;
      case 'kaprodi':
        navigate('/kaprodi');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Akses Ditolak
        </h1>
        <p className="text-gray-600 mb-6">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <button
          onClick={handleGoBack}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;
