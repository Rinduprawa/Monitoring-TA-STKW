import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmation from '../common/LogoutConfirmation';
import ChangePasswordModal from '../common/ChangePasswordModal';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  // Helper to check active menu
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-300 bg-white relative">
        <div className="p-4 border-b border-gray-300 flex items-center gap-2">
          <div className="w-10 h-10 border border-gray-300 flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
          <div>
            <p className="font-medium">Administrator</p>
            <button className="text-sm text-gray-500">&lt;</button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <Link 
            to="/admin/dashboard" 
            className={`block px-4 py-2 border border-gray-300 ${
              isActive('/admin/dashboard') 
                ? 'bg-gray-800 text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            ☒ Dasbor
          </Link>
          <Link 
            to="/admin/data-pengguna" 
            className={`block px-4 py-2 border border-gray-300 ${
              isActive('/admin/data-pengguna') 
                ? 'bg-gray-800 text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            ☒ Data Pengguna
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-100"
          >
            ☒ Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-gray-300 bg-white flex items-center justify-between px-6">
          <h1 className="text-lg font-medium">Sistem Monitoring Tugas Akhir</h1>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 border border-gray-300 flex items-center justify-center"
            >
              🖼️
            </button>
{showDropdown && (
  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg z-10">
    <Link 
      to="/admin/profile" 
      className="block px-4 py-2 hover:bg-gray-100 text-gray-800"
      onClick={() => setShowDropdown(false)}
    >
      Profil
    </Link>
    <button 
      onClick={() => {
        setShowDropdown(false);
        setShowChangePasswordModal(true);
      }}
      className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-t border-gray-300 text-gray-800"
    >
      Ganti Password
    </button>
    <button 
      onClick={() => {
        setShowDropdown(false);
        setShowLogoutModal(true);
      }}
      className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-t border-gray-300 text-gray-800"
    >
      Keluar
    </button>
  </div>
)}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>

      {/* Logout Modal */}
      <LogoutConfirmation 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
            {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
}