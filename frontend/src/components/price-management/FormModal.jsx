import { X } from 'lucide-react';
import FormFields from './FormFields.jsx';

export default function FormModal({ activeTab, item, editMode, categories, onSave, onClose, onChange }) {
    const getTitle = () => {
        const titles = {
            'prices': 'Prix',
            'categories': 'Catégorie',
            'exchange-rates': 'Taux de Change',
            'veeam-licenses': 'Licence Veeam',
            'office365-products': 'Produit Office 365',
            'bandwidth-prices': 'Tarif Bande Passante'
        };
        return `${editMode ? 'Modifier' : 'Ajouter'} ${titles[activeTab]}`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{getTitle()}</h3>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={onSave} className="p-6">
                    <FormFields
                        activeTab={activeTab}
                        item={item}
                        categories={categories}
                        onChange={onChange}
                    />

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100  text-gray-700 
                                     rounded-xl hover:bg-gray-200 
                                     transition-all duration-200 font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white 
                                     rounded-xl hover:from-orange-600 hover:to-orange-700 
                                     transition-all duration-200 font-medium shadow-lg"
                        >
                            {editMode ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}