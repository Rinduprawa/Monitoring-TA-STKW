// src/pages/Profile.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import DetailField from '../components/common/DetailField';

export default function Profile() {
  const navigate = useNavigate();
//   const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/profile');
      setProfileData(response.data.user);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Memproses...</div>;
  }

  // Determine role label
  const getRoleLabel = () => {
    switch (profileData?.role) {
      case 'mahasiswa':
        return 'Mahasiswa';
      case 'dosen':
        return 'Dosen';
      case 'kaprodi':
        return 'Kepala Program Studi';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  };

  // Render fields based on role
  const renderProfileFields = () => {
    const role = profileData?.role;

    switch (role) {
      case 'mahasiswa': {
        const mahasiswa = profileData?.mahasiswa;
        return (
          <>
            <DetailField label="NIM" value={mahasiswa?.nim} />
            <DetailField label="Nama" value={mahasiswa?.nama} />
            <DetailField 
              label="Jenis Kelamin" 
              value={mahasiswa?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} 
            />
            <DetailField label="Program Studi" value={mahasiswa?.prodi?.nama_prodi} />
            <DetailField label="Email" value={profileData?.email} />
            <DetailField 
              label="Bentuk Tugas Akhir" 
              value={mahasiswa?.bentuk_ta === 'penelitian' ? 'Penelitian' : 'Penciptaan'} 
            />
            <DetailField label="Judul Tugas Akhir" value={mahasiswa?.judul_ta} />
            <DetailField 
              label="Dosen Pembimbing 1" 
              value={mahasiswa?.dosenPembimbing1?.nama} 
            />
            <DetailField 
              label="Dosen Pembimbing 2" 
              value={mahasiswa?.dosenPembimbing2?.nama}
              isLast={true}
            />
          </>
        );
      }

      case 'dosen': {
        const dosen = profileData?.dosen;
        return (
          <>
            <DetailField label="NIP" value={dosen?.nip} />
            <DetailField label="Nama" value={dosen?.nama} />
            <DetailField label="Program Studi" value={dosen?.prodi?.nama_prodi} />
            <DetailField label="Email" value={profileData?.email} isLast={true} />
          </>
        );
      }

      case 'kaprodi': {
        const kaprodi = profileData?.kaprodi;
        const dosen = kaprodi?.dosen;
        return (
          <>
            <DetailField label="Nama Prodi" value={kaprodi?.prodi?.nama_prodi} />
            <DetailField label="NIP Kaprodi" value={dosen?.nip} />
            <DetailField label="Nama Kaprodi" value={dosen?.nama} />
            <DetailField label="Email Pribadi Kaprodi" value={profileData?.email} isLast={true} />
          </>
        );
      }

      case 'admin': {
        return (
          <>
            <DetailField label="Nama" value={profileData?.name} />
            <DetailField label="Email" value={profileData?.email} isLast={true} />
          </>
        );
      }

      default:
        return <p className="text-gray-500">Data tidak tersedia</p>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Profil Saya</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
        >
          Kembali
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Foto Profil */}
        <div className="lg:col-span-1">
          <div className="border border-gray-300 bg-white p-6">
            <div className="flex flex-col items-center">
              {/* Placeholder Image */}
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="font-semibold">{getRoleLabel()}</p>
            </div>
          </div>
        </div>

        {/* Card Data Diri */}
        <div className="lg:col-span-2">
          <div className="border border-gray-300 bg-white">
            {/* Header */}
            <div className="border-b border-gray-300 p-4 bg-gray-50">
              <h3 className="font-semibold text-lg">Data Diri</h3>
            </div>

            {/* Detail Fields */}
            <div className="p-4 space-y-4">
              {renderProfileFields()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}