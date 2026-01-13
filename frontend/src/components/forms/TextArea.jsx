export default function TextArea({ label, name, value, onChange, required = false, placeholder = "" }) {
    return (
        <div className="w-full">
            <label className="block mb-2 text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
                rows="4"
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 
                   focus:ring-orange-500 focus:border-orange-500 
                 transition-all"
            />
        </div>
    )
}