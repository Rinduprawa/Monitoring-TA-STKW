import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import LogoutConfirmation from '../common/LogoutConfirmation';

function DashboardAdmin() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard Admin</h1>
            <button
              onClick={handleLogoutClick}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600">Selamat datang, {user?.name}!</p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
  
}

export default DashboardAdmin;
