// src/pages/mahasiswa/Bimbingan.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Bimbingan() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const response = await api.get("/mahasiswa/bimbingan");
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch bimbingan:", error);
      alert("Gagal memuat data bimbingan");
    } finally {
      setLoading(false);
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
    pembimbing,
    next_ujian,
    countdown,
    minimal_bimbingan_next,
    jumlah_bimbingan,
    is_gugur,
    catatans,
  } = data;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Catatan Bimbingan</h1>

      {is_gugur && (
        <div className="bg-red-50 border border-red-300 p-4 rounded mb-6">
          <p className="text-red-800 font-semibold">
            ⚠️ Anda dinyatakan gugur karena tenggat ujian kurang dari 3 hari
          </p>
        </div>
      )}

      {/* INFO CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Card - Mahasiswa Info */}
        <div className="bg-white border border-gray-300 p-6">
          <div className="space-y-3 text-sm">
            <div className="flex">
              <span className="w-40 font-semibold">Judul TA</span>
              <span>: {mahasiswa.judul_ta}</span>
            </div>

            <div className="flex">
              <span className="w-40 font-semibold">Bentuk TA</span>
              <span className="capitalize">: {mahasiswa.bentuk_ta}</span>
            </div>

            <div className="flex flex-col">
              <span className="font-semibold mb-2">Pembimbing:</span>
              <div className="ml-4 space-y-1">
                {pembimbing.pembimbing_1 && (
                  <div className="text-sm">
                    <span className="font-medium">Pembimbing 1:</span>{" "}
                    {pembimbing.pembimbing_1.nama}
                    <br />
                    <span className="text-xs text-gray-600">
                      NIP: {pembimbing.pembimbing_1.nip}
                    </span>
                  </div>
                )}
                {pembimbing.pembimbing_2 && (
                  <div className="text-sm mt-2">
                    <span className="font-medium">Pembimbing 2:</span>{" "}
                    {pembimbing.pembimbing_2.nama}
                    <br />
                    <span className="text-xs text-gray-600">
                      NIP: {pembimbing.pembimbing_2.nip}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {next_ujian && (
              <div className="flex">
                <span className="w-40 font-semibold">
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

        {/* Right Card - Minimal Bimbingan */}
        <div className="bg-white border border-gray-300 p-6 flex flex-col items-center justify-center">
          <p className="text-sm font-semibold mb-2">
            Bimbingan {next_ujian ? ` ${next_ujian}` : ""}
          </p>
          <div className="text-6xl font-bold text-gray-800">
            {jumlah_bimbingan} / {minimal_bimbingan_next}
          </div>
          <p className="text-xs text-gray-600 mt-2">(Saat Ini / Minimum)</p>
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

                  <td className="p-3 border-r border-gray-300">
                    {getUjianLabel(catatan.untuk_ujian)}
                  </td>

                  <td className="p-3 border-r border-gray-300 text-sm">
                    {catatan.ditambahkan_oleh}
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

                  <td className="p-3">
                    <button
                      onClick={() =>
                        navigate(`/mahasiswa/bimbingan/${catatan.id}`)
                      }
                      className="text-lg"
                      title="Lihat Detail"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
