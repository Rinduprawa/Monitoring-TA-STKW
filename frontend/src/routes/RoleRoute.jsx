import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RoleRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (<div className="bg-white h-screen"></div>);
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
