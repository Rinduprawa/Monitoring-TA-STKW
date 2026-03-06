// src/pages/dosen/DetailCatatanBimbingan.jsx

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import api from "../../services/api";

export default function CatatanBimbingan() {
  const { mahasiswaId, catatanId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [mahasiswaId, catatanId]);

  const fetchDetail = async () => {
    try {
      const response = await api.get(
        `/mahasiswa/bimbingan/catatan/${catatanId}`,
      );
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch detail:", error);
      alert("Gagal memuat detail catatan");
      navigate(`/mahasiswa/bimbingan`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Catatan_Bimbingan_${data?.mahasiswa.nim}_${new Date().toISOString().split("T")[0]}`,
    pageStyle: `
      @media print {
        @page {
          margin: 2cm;
        }
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

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

  const getPembimbingLabel = (jenisPenugasan) => {
    return jenisPenugasan === "pembimbing_1" ? "Pembimbing 1" : "Pembimbing 2";
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">Data tidak ditemukan</div>;

  const { mahasiswa, catatan } = data;

  return (
    <div className="p-8">
      {/* Header with Print Button - NOT PRINTED */}
      <div
        className="flex items-center justify-between mb-6"
        style={{ display: "flex" }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/mahasiswa/bimbingan`)}
            className="text-2xl no-print"
          >
            ←
          </button>
          <h1 className="text-2xl font-semibold no-print">
            Detail Catatan Bimbingan
          </h1>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 no-print"
        >
          🖨️ Print
        </button>
      </div>

      {/* Printable Content */}
      <div ref={printRef}>
        {/* Print Header */}
        <div
          className="mb-8 text-center border-b-2 border-gray-800 pb-4 print-only"
          style={{ display: "none" }}
        >
          <h2 className="text-xl font-bold mb-2">
            CATATAN BIMBINGAN TUGAS AKHIR
          </h2>
          <p className="text-sm">PROGRAM STUDI SENI KARAWITAN</p>
          <p className="text-sm">INSTITUT SENI INDONESIA SURAKARTA</p>
        </div>

        <div className="bg-white border border-gray-800 p-8">
          {/* Mahasiswa Info */}
          <div className="mb-6 avoid-break">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-300 pb-2">
              Data Mahasiswa
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-40 font-medium">NIM</span>
                <span>: {mahasiswa.nim}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-medium">Nama</span>
                <span>: {mahasiswa.nama}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-medium">Judul TA</span>
                <span>: {mahasiswa.judul_ta}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-medium">Tahap TA Saat Ini</span>
                <span className="capitalize">
                  : {mahasiswa.tahap_ta.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Catatan Detail */}
          <div className="mb-6 avoid-break">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-300 pb-2">
              Detail Catatan Bimbingan
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <span className="font-medium block mb-1">Judul Bimbingan:</span>
                <p>{catatan.judul_bimbingan}</p>
              </div>

              <div>
                <span className="font-medium block mb-1">
                  Tanggal Bimbingan:
                </span>
                <p>
                  {new Date(catatan.tanggal_bimbingan).toLocaleDateString(
                    "id-ID",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>

              <div>
                <span className="font-medium block mb-1">
                  Bimbingan Untuk Ujian:
                </span>
                <p>{getUjianLabel(catatan.untuk_ujian)}</p>
              </div>

              <div>
                <span className="font-medium block mb-1">
                  Catatan Bimbingan:
                </span>
                <p className="whitespace-pre-wrap border border-gray-300 p-3 bg-gray-50">
                  {catatan.deskripsi}
                </p>
              </div>

              <div>
                <span className="font-medium block mb-1">Dibuat Oleh:</span>
                <p>
                  {catatan.dosen.jenis_penugasan &&
                    getPembimbingLabel(catatan.dosen.jenis_penugasan)}
                  : {catatan.dosen.nama}
                  <br />
                  <span className="text-xs text-gray-600">
                    NIP: {catatan.dosen.nip}
                  </span>
                </p>
              </div>

              <div>
                <span className="font-medium block mb-1">Status:</span>
                <span
                  className={`inline-block px-3 py-1 text-xs border ${
                    catatan.status === "layak_uji"
                      ? "border-green-600 text-green-600 bg-green-50"
                      : "border-yellow-600 text-yellow-600 bg-yellow-50"
                  }`}
                >
                  {catatan.status === "layak_uji" ? "LAYAK UJI" : "REVISI"}
                </span>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          {catatan.status === "layak_uji" && (
            <div
              className="mt-12 pt-8 border-t border-gray-300 avoid-break print-only"
              style={{ display: "none" }}
            >
              <div className="flex justify-between items-start">
                <div className="text-sm">
                  <p className="mb-1">
                    Surakarta,{" "}
                    {new Date(catatan.tanggal_bimbingan).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                  <p className="font-medium">
                    {getPembimbingLabel(catatan.dosen.jenis_penugasan)},
                  </p>
                  <div className="mt-16 border-t border-gray-800 pt-1 inline-block min-w-[200px]">
                    <p className="font-medium">{catatan.dosen.nama}</p>
                    <p className="text-xs">NIP: {catatan.dosen.nip}</p>
                  </div>
                </div>

                <div className="text-sm text-right">
                  <p className="mb-1">Mengetahui,</p>
                  <p className="font-medium">Mahasiswa</p>
                  <div className="mt-16 border-t border-gray-800 pt-1 inline-block min-w-[200px]">
                    <p className="font-medium">{mahasiswa.nama}</p>
                    <p className="text-xs">NIM: {mahasiswa.nim}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Print Footer */}
          <div
            className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600 text-center print-only"
            style={{ display: "none" }}
          >
            <p>
              Dicetak pada:{" "}
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Add inline style for print */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
