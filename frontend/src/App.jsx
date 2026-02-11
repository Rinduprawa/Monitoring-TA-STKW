import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import RoleRoute from './routes/RoleRoute';
import GuestRoute from './routes/GuestRoute';

import Dashboard from './components/layout/Dashboard';
import DataPengguna from './pages/admin/DataPengguna';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import PendaftaranTA from './pages/mahasiswa/PendaftaranTA';
import PendaftaranTAKaprodi from './pages/kaprodi/PendaftaranTA';
import ValidasiPendaftaran from './pages/kaprodi/ValidasiPendaftaran';
import FormPendaftaranTA from './pages/mahasiswa/FormPendaftaranTA';

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
            <Route path="/mahasiswa" element={<Dashboard />} >
              <Route path="/mahasiswa/profil" element={<Profile />} />
              <Route path="dashboard" element={<div>Dashboard Mahasiswa</div>} />
              <Route path="/mahasiswa/pendaftaran-ta" element={<PendaftaranTA />} />
              <Route path="/mahasiswa/pendaftaran-ta/create" element={<FormPendaftaranTA />} />
              <Route path="/mahasiswa/pendaftaran-ta/edit/:id" element={<FormPendaftaranTA />} />
            </Route>
          </Route>

          {/* Protected routes - Dosen */}
          <Route element={<RoleRoute allowedRoles={['dosen']} />}>
            <Route path="/dosen" element={<Dashboard />} >
              <Route path="/dosen/profil" element={<Profile />} />
              <Route path="dashboard" element={<div>Dashboard Dosen</div>} />
            </Route>
          </Route>

          {/* Protected routes - Kaprodi */}
          <Route element={<RoleRoute allowedRoles={['kaprodi']} />}>
            <Route path="/kaprodi" element={<Dashboard />} >
              <Route path="/kaprodi/profil" element={<Profile />} />
              <Route path="dashboard" element={<div>Dashboard Kaprodi</div>} />
              <Route path="/kaprodi/pendaftaran-ta" element={<PendaftaranTAKaprodi />} />
              <Route path="/kaprodi/pendaftaran-ta/validasi/:id" element={<ValidasiPendaftaran />} />
            </Route>
          </Route>

          {/* Protected routes - Admin */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<Dashboard />}>
              <Route path="/admin/profil" element={<Profile />} />
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
