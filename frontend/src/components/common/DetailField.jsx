// src/components/common/DetailField.jsx

export default function DetailField({ label, value, isLast = false }) {
  return (
    <div className={`flex ${!isLast ? 'border-b border-gray-200' : ''} pb-3`}>
      <div className="w-1/3 font-medium text-gray-700">{label}</div>
      <div className="w-2/3">{value || '-'}</div>
    </div>
  );
}
