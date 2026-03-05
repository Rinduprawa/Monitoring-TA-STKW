// src/pages/dosen/DetailBimbingan.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import ConfirmDeleteModal from "../../components/modal/ConfirmDelete";

export default function DetailBimbingan() {
  const { mahasiswaId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchDetail();
  }, [mahasiswaId]);

  const fetchDetail = async () => {
    try {
      const response = await api.get(`/dosen/bimbingan/${mahasiswaId}`);
      setData(response.data);
    } catch (error) {
      alert("Gagal memuat data");
      navigate("/dosen/bimbingan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(
        `/dosen/bimbingan/${mahasiswaId}/catatan/${deleteModal.id}`,
      );
      alert("Catatan berhasil dihapus");
      fetchDetail();
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus catatan");
    }
  };

  const getUjianLabel = (ujian) => {
    const labels = {
      proposal: "Proposal",
      uji_kelayakan_1: "Kelayakan 1",
      tes_tahap_1: "Tahap 1",
      uji_kelayakan_2: "Kelayakan 2",
      tes_tahap_2: "Tahap 2",
      pergelaran: "Pergelaran",
      sidang_skripsi: "Sidang Skripsi",
      sidang_komprehensif: "Sidang Komprehensif",
    };
    return labels[ujian] || ujian;
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">Data tidak ditemukan</div>;

  const {
    mahasiswa,
    next_ujian,
    countdown,
    minimal_bimbingan_next,
    is_gugur,
    catatans,
  } = data;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manajemen Catatan Bimbingan</h1>

        <button
          onClick={() => navigate(`/dosen/bimbingan/${mahasiswaId}/create`)}
          disabled={is_gugur}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          + Tambah Catatan
        </button>
      </div>

      {is_gugur && (
        <div className="bg-red-50 border border-red-300 p-4 rounded mb-6">
          <p className="text-red-800 font-semibold">
            ⚠️ Mahasiswa dinyatakan gugur karena tenggat ujian kurang dari 3
            hari
          </p>
        </div>
      )}

      {/* INFO MAHASISWA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-300 p-6">
          <div className="space-y-3 text-sm">
            <div className="flex">
              <span className="w-32 font-semibold">NIM</span>
              <span>: {mahasiswa.nim}</span>
            </div>

            <div className="flex">
              <span className="w-32 font-semibold">Nama</span>
              <span>: {mahasiswa.nama}</span>
            </div>

            <div className="flex">
              <span className="w-32 font-semibold">Bentuk TA</span>
              <span className="capitalize">: {mahasiswa.bentuk_ta}</span>
            </div>

            <div className="flex">
              <span className="w-32 font-semibold">Judul TA</span>
              <span>: {mahasiswa.judul_ta}</span>
            </div>

            {next_ujian && (
              <div className="flex">
                <span className="w-32 font-semibold">
                  Tenggat sebelum {next_ujian}
                </span>
                <span
                  className={
                    countdown !== null && countdown < 3
                      ? "text-red-600 font-bold"
                      : ""
                  }
                >
                  :{" "}
                  {countdown !== null
                    ? `${countdown} Hari`
                    : "Belum dijadwalkan"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-300 p-6 flex flex-col items-center justify-center">
          <p className="text-sm font-semibold mb-2">
            Bimbingan Minimum {next_ujian ? ` ${next_ujian} ` : "Sebelumnya"}
          </p>
          <div className="text-6xl font-bold text-gray-800">
            {minimal_bimbingan_next}
          </div>
        </div>
      </div>

      {/* TABLE CATATAN */}
      <div className="bg-white border border-gray-800">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="p-3 text-left border-r border-gray-300">No</th>
              <th className="p-3 text-left border-r border-gray-300">
                Tanggal
              </th>
              <th className="p-3 text-left border-r border-gray-300">Judul</th>
              <th className="p-3 text-left border-r border-gray-300">
                Catatan Untuk Uji
              </th>
              <th className="p-3 text-left border-r border-gray-300">
                Ditambahkan Oleh
              </th>
              <th className="p-3 text-left border-r border-gray-300">Status</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {catatans.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  Belum ada catatan bimbingan
                </td>
              </tr>
            ) : (
              catatans.map((catatan, index) => (
                <tr key={catatan.id} className="border-b border-gray-300">
                  <td className="p-3 border-r border-gray-300">{index + 1}</td>

                  <td className="p-3 border-r border-gray-300">
                    {new Date(catatan.tanggal_bimbingan).toLocaleDateString(
                      "id-ID",
                    )}
                  </td>

                  <td className="p-3 border-r border-gray-300">
                    {catatan.judul_bimbingan}
                  </td>

                  {/* ✅ NEW: Untuk Ujian */}
                  <td className="p-3 border-r border-gray-300">
                    {getUjianLabel(catatan.untuk_ujian)}
                  </td>

                  {/* ✅ NEW: Ditambahkan Oleh */}
                  <td className="p-3 border-r border-gray-300">
                    <div className="text-sm">
                      {catatan.ditambahkan_oleh || "-"}
                    </div>
                  </td>
                  <td className="p-3 border-r border-gray-300">
                    <span
                      className={`px-2 py-1 text-xs border ${
                        catatan.status === "layak_uji"
                          ? "border-green-600 text-green-600 bg-green-50"
                          : "border-yellow-600 text-yellow-600 bg-yellow-50"
                      }`}
                    >
                      {catatan.status === "layak_uji" ? "Layak Uji" : "Revisi"}
                    </span>
                  </td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/dosen/bimbingan/${mahasiswaId}/catatan/${catatan.id}`,
                        )
                      }
                      className="text-lg disabled:opacity-50"
                      title="Edit"
                    >
                      👁
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/dosen/bimbingan/${mahasiswaId}/edit/${catatan.id}`,
                        )
                      }
                      hidden={is_gugur}
                      className="text-lg disabled:opacity-50"
                      title="Edit"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() =>
                        setDeleteModal({ isOpen: true, id: catatan.id })
                      }
                      hidden={is_gugur}
                      className="text-lg disabled:opacity-50"
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        message="Apakah Anda yakin ingin menghapus catatan ini?"
      />
    </div>
  );
}
