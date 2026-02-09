import { useAuth } from '../../context/AuthContext';

function DashboardKaprodi() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard Kaprodi</h1>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600">Selamat datang, Kaprodi {user?.kaprodi?.prodi?.nama_prodi}!</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardKaprodi;