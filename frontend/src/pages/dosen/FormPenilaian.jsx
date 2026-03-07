// src/pages/dosen/FormPenilaian.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import FormInput from "../../components/form/FormInput";
import FormTextarea from "../../components/form/FormTextarea";

export default function FormPenilaian() {
  const { pengujiUjianId } = useParams();
  const navigate = useNavigate();
  const isEdit = window.location.pathname.includes("/edit");

  const [formData, setFormData] = useState({
    nilai: "",
    catatan: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [jadwalInfo, setJadwalInfo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get(`/dosen/pengujian/${pengujiUjianId}`);
      const data = response.data;

      setJadwalInfo(data.jadwal);

      if (isEdit && data.penilaian) {
        setFormData({
          nilai: data.penilaian.nilai || "",
          catatan: data.penilaian.catatan || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Gagal memuat data");
      navigate("/dosen/pengujian");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (isEdit) {
        await api.put(`/dosen/pengujian/${pengujiUjianId}`, formData);
        alert("Penilaian berhasil diperbarui");
      } else {
        await api.post(`/dosen/pengujian/${pengujiUjianId}`, formData);
        alert("Penilaian berhasil ditambahkan");
      }

      navigate("/dosen/pengujian");
    } catch (error) {
      console.error("Failed to submit:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || "Gagal menyimpan penilaian");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCatatan = async () => {
    if (!confirm("Yakin ingin menghapus catatan? (Nilai tetap tersimpan)")) {
      return;
    }

    try {
      await api.delete(`/dosen/pengujian/${pengujiUjianId}/catatan`);
      alert("Catatan berhasil dihapus");
      setFormData((prev) => ({ ...prev, catatan: "" }));
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus catatan");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? "Ubah" : "Tambah"} Penilaian
      </h1>

      {jadwalInfo && (
        <div className="bg-gray-50 border border-gray-300 p-4 mb-6">
          <h2 className="font-semibold mb-2">Informasi Ujian</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Mahasiswa:</span>{" "}
              {jadwalInfo.mahasiswa.nama} ({jadwalInfo.mahasiswa.nim})
            </div>
            <div>
              <span className="text-gray-600">Jenis Ujian:</span>{" "}
              {jadwalInfo.jenis_ujian?.replace("_", " ")}
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-300 p-6 max-w-2xl"
      >
        {/* Nilai */}
        <FormInput
          label="Nilai"
          name="nilai"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={formData.nilai}
          onChange={handleChange}
          placeholder="Masukkan nilai (0-100)"
          required
          error={errors.nilai?.[0]}
        />

        {/* Catatan */}
        <FormTextarea
          label="Catatan Penguji"
          name="catatan"
          value={formData.catatan}
          onChange={handleChange}
          rows={5}
          placeholder="Masukkan catatan penguji (opsional)"
          error={errors.catatan?.[0]}
        />

        {/* Buttons */}
        <div className="flex justify-between items-center mt-6">
          <div>
            {isEdit && formData.catatan && (
              <button
                type="button"
                onClick={handleDeleteCatatan}
                className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50"
              >
                Hapus Catatan
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/dosen/pengujian")}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
