import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import RoleRoute from './routes/RoleRoute';
import GuestRoute from './routes/GuestRoute';

// Placeholder components (bikin nanti)
import DashboardMahasiswa from './components/mahasiswa/DashboardMahasiswa';
import DashboardDosen from './components/dosen/DashboardDosen';
import DashboardKaprodi from './components/kaprodi/DashboardKaprodi';
import AdminLayout from './components/admin/AdminLayout';
import DataPengguna from './pages/admin/DataPengguna';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Guest routes - only accessible when not logged in */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes - Mahasiswa */}
          <Route element={<RoleRoute allowedRoles={['mahasiswa']} />}>
            <Route path="/mahasiswa" element={<DashboardMahasiswa />} />
            <Route path="/mahasiswa/profile" element={<Profile />} />
          </Route>

          {/* Protected routes - Dosen */}
          <Route element={<RoleRoute allowedRoles={['dosen']} />}>
            <Route path="/dosen" element={<DashboardDosen />} />
            <Route path="/dosen/profile" element={<Profile />} />
          </Route>

          {/* Protected routes - Kaprodi */}
          <Route element={<RoleRoute allowedRoles={['kaprodi']} />}>
            <Route path="/kaprodi" element={<DashboardKaprodi />} />
            <Route path="/kaprodi/profile" element={<Profile />} />
          </Route>

          {/* Protected routes - Admin */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="/admin/profile" element={<Profile />} />
              <Route path="dashboard" element={<div>Dashboard Admin</div>} />
              <Route path="data-pengguna" element={<DataPengguna />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
