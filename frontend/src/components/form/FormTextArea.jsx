// src/components/form/FormTextarea.jsx

export default function FormTextarea({
  label,
  name,
  value,
  onChange,
  required = false,
  error = null,
  rows = 3,
  placeholder = "",
  disabled = false,
}) {
  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-2 border border-gray-300 disabled:bg-gray-100"
        required={required}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
