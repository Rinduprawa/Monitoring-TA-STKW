// src/pages/mahasiswa/Dashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ProgressStepper from '../../components/common/ProgressStepper';
import InfoCard from '../../components/common/InfoCard';
import RiwayatBimbingan from '../../components/common/RiwayatBimbingan';
import StatusCard from '../../components/common/StatusCard';

export default function DashboardMahasiswa() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8">Data tidak tersedia</div>;
  }

  const { 
    mahasiswa, 
    tenggat, 
    bimbingans, 
    status_pendaftaran, 
    status_proposal,
    nilai_proposal,
    threshold_proposal,
    jadwal_proposal
  } = data;

  // Show full dashboard only when proposal approved & nilai >= threshold
  const showFullDashboard = 
    status_proposal === 'disetujui' && 
    nilai_proposal >= threshold_proposal;

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-6">Selamat Datang, {mahasiswa.nama}</h2>

      {/* Status Cards */}
      {!showFullDashboard && (
        <StatusCard
          statusPendaftaran={status_pendaftaran}
          statusProposal={status_proposal}
          nilaiProposal={nilai_proposal}
          thresholdProposal={threshold_proposal}
          jadwalProposal={jadwal_proposal}
          onNavigate={(path) => navigate(path)}
        />
      )}

      {/* Full Dashboard */}
      {showFullDashboard && (
        <>
          <ProgressStepper
            tahapTA={mahasiswa.tahap_ta}
            bentukTA={mahasiswa.bentuk_ta}
            tenggat={tenggat}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfoCard mahasiswa={mahasiswa} />
            <RiwayatBimbingan bimbingans={bimbingans} />
          </div>
        </>
      )}
    </div>
  );
}
