// src/pages/dosen/FormCatatanBimbingan.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import FormInput from "../../components/form/FormInput";
import FormSelect from "../../components/form/FormSelect";
import FormTextarea from "../../components/form/FormTextarea";

export default function FormCatatanBimbingan() {
  const { mahasiswaId, catatanId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(catatanId);

  const [formData, setFormData] = useState({
    judul_bimbingan: "",
    tanggal_bimbingan: "",
    status: "revisi",
    deskripsi: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ NEW: State untuk validasi layak uji
  const [canMarkLayakUji, setCanMarkLayakUji] = useState(false);
  const [bimbinganInfo, setBimbinganInfo] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const statusOptions = [
    { value: "revisi", label: "Revisi", disabled: false },
    {
      value: "layak_uji",
      label: canMarkLayakUji
        ? "Layak Uji"
        : !bimbinganInfo?.is_pembimbing_1
          ? "Layak Uji (Hanya Pembimbing 1)"
          : bimbinganInfo?.has_layak_uji
            ? "Layak Uji (Sudah ada dari Pembimbing 1)"
            : `Layak Uji (Minimal ${bimbinganInfo?.minimal_bimbingan_next || 0} bimbingan)`,
      disabled: !canMarkLayakUji,
    },
  ];

  useEffect(() => {
    if (isEdit) {
      fetchCatatan();
    } else {
      // ✅ Fetch info saat mode create
      fetchBimbinganInfo();
    }
  }, [catatanId]);

  // ✅ NEW: Fetch bimbingan info untuk validasi
  const fetchBimbinganInfo = async () => {
    try {
      const response = await api.get(`/dosen/bimbingan/${mahasiswaId}`);
      const data = response.data;

      setBimbinganInfo(data);
      setCanMarkLayakUji(data.can_mark_layak_uji || false);
    } catch (error) {
      console.error("Failed to fetch bimbingan info:", error);
    }
  };

  const fetchCatatan = async () => {
    try {
      const response = await api.get(
        `/dosen/bimbingan/${mahasiswaId}/catatan/${catatanId}`,
      );

      const data = response.data.catatan;

      setFormData({
        judul_bimbingan: data.judul_bimbingan || "",
        tanggal_bimbingan: data.tanggal_bimbingan?.split("T")[0] || "",
        status: data.status || "revisi",
        deskripsi: data.deskripsi || "",
      });

      // ✅ NEW: Untuk edit, jika sudah layak_uji, allow edit status tersebut
      if (data.status === "layak_uji") {
        setCanMarkLayakUji(true);
      } else {
        fetchBimbinganInfo(); // Check if can mark layak_uji
      }
    } catch (error) {
      console.error("Failed to fetch catatan:", error);
      alert("Gagal memuat data catatan");
      navigate(`/dosen/bimbingan/${mahasiswaId}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
        await api.put(
          `/dosen/bimbingan/${mahasiswaId}/catatan/${catatanId}`,
          formData,
        );
        alert("Catatan bimbingan berhasil diperbarui");
      } else {
        await api.post(`/dosen/bimbingan/${mahasiswaId}/catatan`, formData);
        alert("Catatan bimbingan berhasil ditambahkan");
      }

      navigate(`/dosen/bimbingan/${mahasiswaId}`);
    } catch (error) {
      console.error("Failed to submit:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || "Gagal menyimpan catatan");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? "Edit" : "Tambah"} Catatan Bimbingan
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-300 p-6 max-w-2xl"
      >
        {/* Judul Bimbingan */}
        <FormInput
          label="Judul Bimbingan"
          name="judul_bimbingan"
          value={formData.judul_bimbingan}
          onChange={handleChange}
          placeholder="Masukkan judul bimbingan"
          required
          error={errors.judul_bimbingan?.[0]}
        />

        {/* Tanggal */}
        <FormInput
          label="Tanggal"
          name="tanggal_bimbingan"
          type="date"
          value={formData.tanggal_bimbingan}
          onChange={handleChange}
          max={today}
          required
          error={errors.tanggal_bimbingan?.[0]}
        />

        {/* Status Bimbingan */}
        <FormSelect
          label="Status Bimbingan"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          required
          error={errors.status?.[0]}
        />

        {/* Catatan Bimbingan */}
        <FormTextarea
          label="Catatan Bimbingan"
          name="deskripsi"
          value={formData.deskripsi}
          onChange={handleChange}
          rows={5}
          placeholder="Masukkan catatan bimbingan"
          required
          error={errors.deskripsi?.[0]}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate(`/dosen/bimbingan/${mahasiswaId}`)}
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
      </form>
    </div>
  );
}
