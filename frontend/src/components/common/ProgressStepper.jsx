// src/components/mahasiswa/ProgressStepper.jsx

export default function ProgressStepper({ tahapTA, bentukTA, tenggat }) {
  const stepsPenelitian = [
    { key: 'proposal', label: 'Uji Proposal' },
    { key: 'uji_kelayakan_1', label: 'Uji Kelayakan 1' },
    { key: 'uji_kelayakan_2', label: 'Uji Kelayakan 2' },
    { key: 'sidang_skripsi', label: 'Sidang Skripsi' },
  ];

  const stepsPenciptaan = [
    { key: 'proposal', label: 'Uji Proposal' },
    { key: 'tes_tahap_1', label: 'Tes Tahap 1' },
    { key: 'tes_tahap_2', label: 'Tes Tahap 2' },
    { key: 'pergelaran', label: 'Pergelaran' },
    { key: 'sidang_komprehensif', label: 'Sidang Komprehensif' },
  ];

  const steps = bentukTA === 'penelitian' ? stepsPenelitian : stepsPenciptaan;
  const currentIndex = steps.findIndex(s => s.key === tahapTA);

  return (
    <div className="mb-6 bg-white border border-gray-300 p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold
                  ${index <= currentIndex
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                  }`}
              >
                {index < currentIndex ? '✓' : index + 1}
              </div>
              <p className={`text-sm mt-2 text-center ${index <= currentIndex ? 'font-semibold' : 'text-gray-500'}`}>
                {step.label}
              </p>
              {index === currentIndex && tenggat && (
                <p className="text-xs text-gray-500 mt-1">
                  Tenggat: {new Date(tenggat).toLocaleDateString('id-ID')}
                </p>
              )}
            </div>

            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${index < currentIndex ? 'bg-green-500' : 'bg-gray-300'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}