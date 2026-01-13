import { Edit, Trash2 } from 'lucide-react';

export default function TableRow({ activeTab, item, categories, onEdit, onDelete }) {
    const renderCell = () => {
        switch (activeTab) {
            case 'prices':
                return (
                    <>
                        <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                                {item.name}
                            </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {item.key}
                            </code>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {item.solution_display || item.solution}
                            </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                                {item.category_name || categories.find(c => c.id === item.category)?.name || 'N/A'}
                            </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                                {new Intl.NumberFormat('fr-FR').format(item.value)} {item.currency}
                            </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                                {item.unit_display || item.unit}
                            </span>
                        </td>
                    </>
                );

            case 'categories':
                return (
                    <>
                        <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                                {item.name}
                            </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {item.code}
                            </code>
                        </td>
                        <td className="px-4 py-4">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                                {item.description || '-'}
                            </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{item.order}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                {item.prices_count || 0}
                            </span>
                        </td>
                    </>
                );

            case 'exchange-rates':
                return (
                    <>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                                {item.source_currency}
                            </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                                {item.target_currency}
                            </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-green-600 ">
                                {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(item.rate)}
                            </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                                {item.effective_from ? new Date(item.effective_from).toLocaleDateString('fr-FR') : '-'}
                            </span>
                        </td>
                    </>
                );

            case 'veeam-licenses':
                return (
                    <>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {item.license_type}
                            </code>
                        </td>
                        <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs">
                                {item.label}
                            </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                                {item.unit_display || item.unit}
                            </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-purple-600">
                                {item.points}
                            </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{item.order}</span>
                        </td>
                    </>
                );

            case 'office365-products':
                return (
                    <>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {item.product_id}
                            </code>
                        </td>
                        <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                                {item.name}
                            </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-green-600">
                                ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.price_usd_annual)}
                            </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{item.unit}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{item.order}</span>
                        </td>
                    </>
                );

            case 'bandwidth-prices':
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800">
                                {item.bandwidth_type_display || item.bandwidth_type}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                                {item.bandwidth_mbps}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-green-600 ">
                                {new Intl.NumberFormat('fr-FR').format(item.price)} FCFA
                            </span>
                        </td>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-150">
            {renderCell()}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {item.is_active ? 'Actif' : 'Inactif'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-orange-600 hover:bg-orange-50  
                                 rounded-lg transition-colors duration-200"
                        title="Modifier"
                    >
                        <Edit className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(item)}
                        className="p-2 text-red-600 hover:bg-red-50
                                 rounded-lg transition-colors duration-200"
                        title="Supprimer"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}