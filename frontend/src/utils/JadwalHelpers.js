export const getJenisUjianLabel = (jenisUjian) => {
  const labels = {
    'proposal': 'Proposal',
    'uji_kelayakan_1': 'Kelayakan 1',
    'tes_tahap_1': 'Tahap 1',
    'uji_kelayakan_2': 'Kelayakan 2',
    'tes_tahap_2': 'Tahap 2',
    'pergelaran': 'Pergelaran',
    'sidang_skripsi': 'Sidang Skripsi',
    'sidang_komprehensif': 'Sidang Komprehensif',
  };
  return labels[jenisUjian] || jenisUjian;
};

export const formatTanggal = (tanggal, hari = null) => {
  const date = new Date(tanggal);
  const hariName = hari || date.toLocaleDateString('id-ID', { weekday: 'long' });
  const tanggalStr = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return `${hariName}, ${tanggalStr}`;
};

export const getCountdownStatus = (tanggal) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const examDate = new Date(tanggal);
  examDate.setHours(0, 0, 0, 0);
  
  if (examDate < today) {
    return {
      type: 'selesai',
      label: 'Selesai',
      color: 'bg-green-50 border-green-600 text-green-600'
    };
  }
  
  const diffTime = examDate - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysLeft === 0) {
    return {
      type: 'today',
      label: 'Hari ini',
      color: 'bg-red-50 border-red-600 text-red-600'
    };
  } else if (daysLeft === 1) {
    return {
      type: 'tomorrow',
      label: 'Besok',
      color: 'bg-orange-50 border-orange-600 text-orange-600'
    };
  } else if (daysLeft <= 7) {
    return {
      type: 'soon',
      label: `${daysLeft} hari lagi`,
      color: 'bg-yellow-50 border-yellow-600 text-yellow-600'
    };
  } else {
    return {
      type: 'upcoming',
      label: `${daysLeft} hari lagi`,
      color: 'bg-blue-50 border-blue-600 text-blue-600'
    };
  }
};

export const getJenisPengujiLabel = (jenis) => {
  const labels = {
    'penguji_struktural': 'Struktural',
    'penguji_ahli': 'Ahli',
    'penguji_pembimbing': 'Pembimbing',
    'penguji_stakeholder': 'Stakeholder',
  };
  return labels[jenis] || jenis;
};