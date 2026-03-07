// src/pages/dosen/PengujianTA.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function PengujianTA() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("proposal");
  const [ujians, setUjians] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { value: "proposal", label: "Proposal" },
    { value: "uji_kelayakan_1,tes_tahap_1", label: "Kelayakan / Tahap 1" },
    { value: "uji_kelayakan_2,tes_tahap_2", label: "Kelayakan / Tahap 2" },
    { value: "pergelaran", label: "Pergelaran" },
    { value: "sidang_skripsi,sidang_komprehensif", label: "Sidang Akhir" },
  ];

  const showJenisUjiColumn = [
    "uji_kelayakan_1,tes_tahap_1",
    "uji_kelayakan_2,tes_tahap_2",
    "sidang_skripsi,sidang_komprehensif",
  ].includes(activeTab);

  useEffect(() => {
    fetchUjians();
  }, [activeTab]);

  const fetchUjians = async () => {
    setLoading(true);
    try {
      const response = await api.get("/dosen/pengujian", {
        params: { jenis_ujian: activeTab },
      });
      setUjians(response.data.data);
    } catch (error) {
      console.error("Failed to fetch ujians:", error);
    } finally {
      setLoading(false);
    }
  };

  const getJenisUjiLabel = (jenisUjian) => {
    const labels = {
      proposal: "Proposal",
      uji_kelayakan_1: "Kelayakan 1",
      uji_kelayakan_2: "Kelayakan 2",
      tes_tahap_1: "Tahap 1",
      tes_tahap_2: "Tahap 2",
      pergelaran: "Pergelaran",
      sidang_skripsi: "Sidang Skripsi",
      sidang_komprehensif: "Sidang Komprehensif",
    };
    return labels[jenisUjian] || jenisUjian;
  };

  const formatPelaksanaan = (tanggal, jamMulai, jamSelesai) => {
    const date = new Date(tanggal);
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const hari = days[date.getDay()];
    const tanggalStr = `${date.getDate()} ${months[date.getMonth()]}`;
    const waktu = `${jamMulai?.slice(0, 5)} - ${jamSelesai?.slice(0, 5)}`;

    return { hari, tanggalStr, waktu };
  };

  const handleAction = (ujian) => {
    const pengujiUjianId = ujian.penguji_ujian_id;

    if (!pengujiUjianId) {
      alert("Error: Penguji ujian ID tidak ditemukan");
      return;
    }

    if (ujian.is_locked) {
      // Locked -> View only
      navigate(`/dosen/pengujian/${pengujiUjianId}/detail`);
    } else if (ujian.has_penilaian) {
      // Has penilaian but not locked -> Can edit or view
      navigate(`/dosen/pengujian/${pengujiUjianId}/edit`);
    } else {
      // No penilaian -> Add new
      navigate(`/dosen/pengujian/${pengujiUjianId}/tambah`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Pengujian Tugas Akhir</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 border whitespace-nowrap ${
              activeTab === tab.value
                ? "border-gray-800 bg-gray-100 font-semibold"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : ujians.length === 0 ? (
        <div className="border border-gray-300 bg-white p-8 text-center text-gray-500">
          Tidak ada ujian
        </div>
      ) : (
        <div className="border border-gray-800 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="p-3 text-left border-r border-gray-300 w-12">
                  No
                </th>
                <th className="p-3 text-left border-r border-gray-300">
                  Nama Mahasiswa
                </th>
                {showJenisUjiColumn && (
                  <th className="p-3 text-left border-r border-gray-300">
                    Jenis Uji
                  </th>
                )}
                <th className="p-3 text-left border-r border-gray-300">
                  Sebagai Penguji
                </th>
                <th className="p-3 text-left border-r border-gray-300">
                  Pelaksanaan Ujian
                </th>
                <th className="p-3 text-left border-r border-gray-300">
                  Nilai
                </th>
                <th className="p-3 text-left border-r border-gray-300">
                  Catatan
                </th>
                <th className="p-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ujians.map((ujian, index) => {
                const pelaksanaan = formatPelaksanaan(
                  ujian.tanggal,
                  ujian.jam_mulai,
                  ujian.jam_selesai,
                );

                return (
                  <tr key={ujian.id} className="border-b border-gray-200">
                    <td className="p-3 border-r border-gray-300">
                      {index + 1}
                    </td>
                    <td className="p-3 border-r border-gray-300">
                      <div>
                        <p className="font-medium">{ujian.mahasiswa.nama}</p>
                        <p className="text-xs text-gray-500">
                          {ujian.mahasiswa.nim}
                        </p>
                      </div>
                    </td>
                    {showJenisUjiColumn && (
                      <td className="p-3 border-r border-gray-300 text-sm">
                        {getJenisUjiLabel(ujian.jenis_ujian)}
                      </td>
                    )}
                    <td className="p-3 border-r border-gray-300 text-sm">
                      {ujian.sebagai_penguji}
                    </td>
                    <td className="p-3 border-r border-gray-300 text-sm">
                      <div>
                        <div>
                          {pelaksanaan.hari}, {pelaksanaan.tanggalStr}
                        </div>
                        <div className="text-gray-600">{pelaksanaan.waktu}</div>
                      </div>
                    </td>
                    <td className="p-3 border-r border-gray-300 text-sm">
                      {ujian.penilaian ? ujian.penilaian.nilai : "-"}
                    </td>
                    <td className="p-3 border-r border-gray-300 text-sm">
                      {ujian.penilaian?.catatan
                        ? ujian.penilaian.catatan.slice(0, 30) + "..."
                        : "-"}
                    </td>
                    <td className="p-3">
                      {ujian.is_locked ? (
                        <button
                          onClick={() => handleAction(ujian)}
                          className="px-3 py-1 border border-gray-300 hover:bg-gray-50 text-sm flex items-center gap-1"
                        >
                          🔒 Lihat Detail
                        </button>
                      ) : ujian.has_penilaian ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/dosen/pengujian/${ujian.penguji_ujian_id}/edit`,
                              )
                            }
                            className="px-3 py-1 border border-gray-300 hover:bg-gray-50 text-sm"
                          >
                            ✏️ Ubah
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/dosen/pengujian/${ujian.penguji_ujian_id}/detail`,
                              )
                            }
                            className="px-3 py-1 border border-gray-300 hover:bg-gray-50 text-sm"
                          >
                            👁 Lihat
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAction(ujian)}
                          className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 text-sm"
                        >
                          + Tambah Nilai
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
