export default function FormSelect({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [],
  placeholder = 'Pilih...',
  required = false,
  error = null,
  disabled = false
}) {
  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:border-gray-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}