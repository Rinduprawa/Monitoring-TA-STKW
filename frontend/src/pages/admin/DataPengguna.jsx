import { useState, useEffect } from 'react';
import axios from 'axios';
import UserForm from './FormUser';
import KaprodiForm from './FormKaprodi';
import UserDetail from './DetailUser';

export default function DataPengguna() {
  const [activeTab, setActiveTab] = useState('mahasiswa');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState({
    mahasiswa: null,
    dosen: null,
    kaprodi: null,
  });

  const [view, setView] = useState('list');
  const [formMode, setFormMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedKaprodi, setSelectedKaprodi] = useState(null);
  const [viewDetail, setViewDetail] = useState(null);

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    if (view === 'list') {
      fetchData();
    }
  }, [activeTab, view]);

  const fetchData = async () => {
    if (cache[activeTab]) {
      setData(cache[activeTab]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${activeTab}`);
      const newData = activeTab === 'kaprodi' 
        ? response.data 
        : response.data.data;
      
      setData(newData);
      setCache(prev => ({ ...prev, [activeTab]: newData }));
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id) => {
    if (confirm('Yakin ingin mengaktifkan kembali pengguna ini?')) {
      try {
        const response = await axios.post(`${API_URL}/${activeTab}/${id}/activate`);
        alert(response.data.message || 'Pengguna berhasil diaktifkan');
        
        // ✅ Clear cache and reload
        setCache(prev => ({ ...prev, [activeTab]: null }));
        await fetchData(); // Force reload
      } catch (error) {
        console.error('Error activating:', error);
        alert('Gagal mengaktifkan pengguna');
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menonaktifkan pengguna ini?')) {
      try {
        const response = await axios.delete(`${API_URL}/${activeTab}/${id}`);
        alert(response.data.message || 'Pengguna berhasil dinonaktifkan');
        
        // ✅ Clear cache and reload
        setCache(prev => ({ ...prev, [activeTab]: null }));
        await fetchData(); // Force reload
      } catch (error) {
        console.error('Error deactivating:', error);
        alert('Gagal menonaktifkan pengguna');
      }
    }
  };

  const handleResetPassword = async (id) => {
    if (confirm('Reset password menjadi password1234?')) {
      try {
        const response = await axios.post(`${API_URL}/${activeTab}/${id}/reset-password`);
        alert(response.data.message || 'Password berhasil direset');
      } catch (error) {
        console.error('Error reset password:', error);
        alert('Gagal reset password');
      }
    }
  };

  const handleEdit = (item) => {
    if (activeTab === 'kaprodi') {
      setSelectedKaprodi(item);
      setFormMode('edit');
      setView('form');
    } else {
      setSelectedUser(item);
      setFormMode('edit');
      setView('form');
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setFormMode('create');
    setView('form');
  };

  const handleView = (item) => {
    setViewDetail(item);
    setView('detail');
  };
  
  const handleFormSuccess = () => {
    setView('list');
    setCache(prev => ({ ...prev, [activeTab]: null }));
    fetchData();
  };

  const getColumnHeader = () => {
    if (activeTab === 'mahasiswa') return 'NIM';
    return 'NIP/NIDN';
  };

  const isUserActive = (item) => {
    return item.user?.is_active !== false;
  };

  // Render Form View
  if (view === 'form') {
    if (activeTab === 'kaprodi') {
      return (
        <KaprodiForm
          kaprodiData={selectedKaprodi}
          onCancel={() => setView('list')}
          onSuccess={handleFormSuccess}
        />
      );
    }
    
    return (
      <UserForm
        mode={formMode}
        userData={selectedUser}
        activeTab={activeTab}
        onCancel={() => setView('list')}
        onSuccess={handleFormSuccess}
      />
    );
  }

  if (view === 'detail') {
    return (
      <UserDetail
        userData={viewDetail}
        activeTab={activeTab}
        onClose={() => setView('list')}
      />
    );
  }
  
  // Render List View
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium">Manajemen Pengguna</h2>
        {activeTab !== 'kaprodi' && (
          <button 
            onClick={handleCreate}
            className="px-4 py-2 border border-gray-800"
          >
            + Tambah Pengguna
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('mahasiswa')}
          className={`px-6 py-2 border border-gray-800 ${
            activeTab === 'mahasiswa' ? 'bg-gray-800 text-white' : 'bg-white'
          }`}
        >
          Mahasiswa
        </button>
        <button
          onClick={() => setActiveTab('dosen')}
          className={`px-6 py-2 border border-gray-800 ${
            activeTab === 'dosen' ? 'bg-gray-800 text-white' : 'bg-white'
          }`}
        >
          Dosen
        </button>
        <button
          onClick={() => setActiveTab('kaprodi')}
          className={`px-6 py-2 border border-gray-800 ${
            activeTab === 'kaprodi' ? 'bg-gray-800 text-white' : 'bg-white'
          }`}
        >
          Kaprodi
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-800 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="p-3 text-left border-r border-gray-300">No</th>
              <th className="p-3 text-left border-r border-gray-300">Nama</th>
              <th className="p-3 text-left border-r border-gray-300">
                {getColumnHeader()}
              </th>
              <th className="p-3 text-left border-r border-gray-300">Program Studi</th>
              <th className="p-3 text-left border-r border-gray-300">Email</th>
              {/* ✅ Only show Status for mahasiswa & dosen */}
              {activeTab !== 'kaprodi' && (
                <th className="p-3 text-left border-r border-gray-300">Status</th>
              )}
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={activeTab === 'kaprodi' ? "6" : "7"} className="p-4 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'kaprodi' ? "6" : "7"} className="p-4 text-center">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const active = isUserActive(item);
                
                return (
                  <tr 
                    key={item.id} 
                    className={`border-b border-gray-300 ${!active && activeTab !== 'kaprodi' ? 'bg-gray-100' : ''}`}
                  >
                    <td className="p-3 border-r border-gray-300">{index + 1}</td>
                    <td className="p-3 border-r border-gray-300">
                      {activeTab === 'kaprodi' ? item.dosen?.nama : item.nama}
                    </td>
                    <td className="p-3 border-r border-gray-300">
                      {activeTab === 'mahasiswa' 
                        ? item.nim 
                        : activeTab === 'kaprodi'
                        ? item.dosen?.nip
                        : item.nip
                      }
                    </td>
                    <td className="p-3 border-r border-gray-300">
                      {item.prodi?.nama_prodi || '-'}
                    </td>
                    <td className="p-3 border-r border-gray-300">
                      {item.user?.email || '-'}
                    </td>
                    
                    {/* ✅ Status column only for mahasiswa & dosen */}
                    {activeTab !== 'kaprodi' && (
                      <td className="p-3 border-r border-gray-300">
                        <span className={`px-2 py-1 text-xs border ${
                          active 
                            ? 'bg-green-50 border-green-600 text-green-600' 
                            : 'bg-gray-50 border-gray-600 text-gray-600'
                        }`}>
                          {active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    )}
                    
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleView(item)}
                        className="text-lg"
                        title="Lihat">👁️
                      </button>
                      <button 
                        onClick={() => handleEdit(item)}
                        className="text-lg" 
                        title="Edit"
                        disabled={!active && activeTab !== 'kaprodi'}
                      >
                        ✏️
                      </button>
                      
                      {/* ✅ No activate/deactivate for kaprodi */}
                      {activeTab !== 'kaprodi' && (
                        active ? (
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-lg" 
                            title="Nonaktifkan"
                          >
                            🗑️
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivate(item.id)}
                            className="text-lg" 
                            title="Aktifkan Kembali"
                          >
                            ✅
                          </button>
                        )
                      )}
                      
                      <button 
                        onClick={() => handleResetPassword(item.id)}
                        className="text-lg" 
                        title="Reset Password"
                        disabled={!active && activeTab !== 'kaprodi'}
                      >
                        🔑
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}