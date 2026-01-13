import { Trash2 } from 'lucide-react';

export default function DeleteModal({ item, activeTab, onConfirm, onCancel }) {
    const getItemName = () => {
        switch (activeTab) {
            case 'prices':
                return item.name;
            case 'categories':
                return item.name;
            case 'exchange-rates':
                return `${item.source_currency} → ${item.target_currency}`;
            case 'veeam-licenses':
                return item.label;
            case 'office365-products':
                return item.name;
            case 'bandwidth-prices':
                return `${item.bandwidth_type} ${item.bandwidth_mbps} Mbps`;
            default:
                return '';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            Confirmer la suppression
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Cette action est irréversible
                        </p>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-700">
                        Êtes-vous sûr de vouloir supprimer <strong>"{getItemName()}"</strong> ?
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 
                                 rounded-xl hover:bg-gray-200
                                 transition-all duration-200 font-medium"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white 
                                 rounded-xl hover:from-red-600 hover:to-red-700 
                                 transition-all duration-200 font-medium shadow-lg"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
}