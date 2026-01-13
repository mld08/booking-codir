export default function SelectField({ label, name, value, onChange, options, required, icon: Icon }) {
    return (
        <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-orange-500">*</span>}
            </label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <select
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl
                   text-gray-900
                   focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20
                   transition-all duration-200 outline-none appearance-none cursor-pointer
                   group-hover:border-gray-300`}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    )
}