import React from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import InputText from './InputText';

export default function LicensesOfficeField({ label, value = [], onChange, licenses }) {
    // Initialiser avec un élément vide si le tableau est vide
    const handleAdd = () => {
        onChange([...value, { product_id: '', quantity: 1 }]);
    };
    const handleRemove = (index) => {
        const newValue = value.filter((_, i) => i !== index);
        onChange(newValue);
    };

    const handleChange = (index, field, val) => {
        const newValue = [...value];
        newValue[index] = { ...newValue[index], [field]: val };
        onChange(newValue);
    };
    // S'assurer qu'il y a au moins un champ
    const items = value.length > 0 ? value : [{ product_id: '', quantity: 1 }];
    return (
        <div className="col-span-full space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600
                        transition-all duration-200 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter une licence
                </button>
            </div>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
                    >
                        <div className="grid md:grid-cols-[1fr_150px_auto] gap-3 items-end">
                            {/* Select de licence */}
                            <div className="group">
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                    Type de licences
                                </label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                    <select
                                        value={item.product_id}
                                        onChange={(e) => handleChange(index, 'product_id', e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-gray-200 rounded-lg
                                    text-sm text-gray-900
                                    focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20
                                    transition-all duration-200"
                                    >
                                        <option value="" disabled>-- Sélectionner une licence --</option>
                                        {licenses.map((license) => (
                                            <option key={license.value} value={license.value}>
                                                {license.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Quantité de licences */}
                            <InputText
                                label="Quantité"
                                type="number"
                                min={1}
                                value={item.quantity || ''}
                                onChange={(val) => handleChange(index, 'quantity', val)}
                                placeholder="Ex: 1"
                            />
                            {/* Bouton de suppression */}
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200
                            transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
