import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="bg-white h-screen"></div>;
  }

  // If user is already logged in, redirect to dashboard based on role
  if (user) {
    const dashboardRoutes = {
      mahasiswa: '/mahasiswa',
      dosen: '/dosen',
      kaprodi: '/kaprodi',
      admin: '/admin',
    };
    return <Navigate to={dashboardRoutes[user.role] || '/mahasiswa'} replace />;
  }

  // If not logged in, show the guest page (login)
  return <Outlet />;
}

export default GuestRoute;
