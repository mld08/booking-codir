export default function DetailCard({ icon: Icon, label, value }) {
    return (
        <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-orange-500" />
                <p className="text-sm text-gray-500">{label}</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    );
}