import React from 'react';
import { Plus, Trash2, Package } from 'lucide-react';

export default function LicensesField({ label, value = [], onChange, licenses }) {
  // Initialiser avec un élément vide si le tableau est vide
  const handleAdd = () => {
    onChange([...value, { license_type: '', quantity: 1 }]);
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
  const items = value.length > 0 ? value : [{ license_type: '', quantity: 1 }];

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
                  Type de licence
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <select
                    value={item.license_type}
                    onChange={(e) => handleChange(index, 'license_type', e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-gray-200 rounded-lg
                             text-sm text-gray-900
                             focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20
                             transition-all duration-200 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Sélectionner une licence</option>
                    {licenses.map((license) => (
                      <option key={license.value} value={license.value}>
                        {license.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Input quantité */}
              <div className="group">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Quantité
                </label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg
                           text-sm text-gray-900
                           focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20
                           transition-all duration-200 outline-none"
                />
              </div>

              {/* Bouton supprimer */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={items.length === 1}
                className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg
                         transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Supprimer cette licence"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Aucune licence sélectionnée. Cliquez sur "Ajouter une licence" pour commencer.
        </div>
      )}
    </div>
  );
}