// src/pages/dosen/DetailPenilaian.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function DetailPenilaian() {
  const { pengujiUjianId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get(`/dosen/pengujian/${pengujiUjianId}`);
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Gagal memuat data");
      navigate("/dosen/pengujian");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!data || !data.penilaian) {
    return (
      <div className="p-8">
        <p>Data tidak ditemukan</p>
        <button
          onClick={() => navigate("/dosen/pengujian")}
          className="mt-4 px-4 py-2 border border-gray-300"
        >
          Kembali
        </button>
      </div>
    );
  }

  const { jadwal, penilaian, is_locked } = data;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
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
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID");
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Detail Penilaian</h1>
        {is_locked && (
          <span className="px-3 py-1 bg-gray-200 border border-gray-400 text-sm font-semibold">
            🔒 Nilai Sudah Di-lock
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-300 p-6 max-w-3xl">
        {/* Info Ujian */}
        <div className="mb-6 pb-6 border-b border-gray-300">
          <h2 className="font-semibold mb-4">Informasi Ujian</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">NIM:</span>
              <p className="font-medium">{jadwal.mahasiswa.nim}</p>
            </div>
            <div>
              <span className="text-gray-600">Nama Mahasiswa:</span>
              <p className="font-medium">{jadwal.mahasiswa.nama}</p>
            </div>
            <div>
              <span className="text-gray-600">Jenis Ujian:</span>
              <p className="font-medium capitalize">
                {jadwal.jenis_ujian?.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Tanggal Pelaksanaan:</span>
              <p className="font-medium">{formatDate(jadwal.tanggal)}</p>
            </div>
          </div>
        </div>

        {/* Penilaian */}
        <div className="mb-6 pb-6 border-b border-gray-300">
          <h2 className="font-semibold mb-4">Penilaian</h2>
          <div className="space-y-4">
            <div>
              <span className="text-gray-600 text-sm">Nilai:</span>
              <p className="text-3xl font-bold text-blue-600">
                {penilaian.nilai}
              </p>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Catatan Penguji:</span>
              <p className="mt-1 text-sm whitespace-pre-wrap">
                {penilaian.catatan || (
                  <span className="text-gray-400">Tidak ada catatan</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div>
          <h2 className="font-semibold mb-4">Informasi Tambahan</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Dibuat:</span>
              <p className="font-medium">
                {formatDateTime(penilaian.created_at)}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Terakhir Diubah:</span>
              <p className="font-medium">
                {formatDateTime(penilaian.updated_at)}
              </p>
            </div>
            {penilaian.locked_at && (
              <div>
                <span className="text-gray-600">Di-lock:</span>
                <p className="font-medium">
                  {formatDateTime(penilaian.locked_at)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-300">
          <button
            onClick={() => navigate("/dosen/pengujian")}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
          >
            Kembali
          </button>
          {!is_locked && (
            <button
              onClick={() =>
                navigate(`/dosen/pengujian/${pengujiUjianId}/edit`)
              }
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              Ubah Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
