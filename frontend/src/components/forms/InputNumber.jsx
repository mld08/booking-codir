export default function InputNumber({ label, name, value, onChange, step = "1", min = "0", icon: Icon }) {
    return (
      <div className="group">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <input
                type="number"
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                step={step}
                min={min}
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl
                   text-gray-900 placeholder-gray-400
                   focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20
                   transition-all duration-200 outline-none
                   group-hover:border-gray-300`}
            />
        </div>
    </div>
    )
}