import { AlertCircle } from 'lucide-react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

export default function DataTable({ activeTab, data, onEdit, onDelete, categories }) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-500">Aucune donnée trouvée</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <TableHeader activeTab={activeTab} />
                <tbody className="divide-y divide-gray-200">
                    {data.map((item) => (
                        <TableRow
                            key={item.id}
                            activeTab={activeTab}
                            item={item}
                            categories={categories}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}