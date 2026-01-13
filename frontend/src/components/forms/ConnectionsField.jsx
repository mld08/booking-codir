// FOR COLOCATION

import React from 'react';
import { Plus, Trash2, Wifi } from 'lucide-react';

export default function ConnectionsField({ 
  label, 
  value = [], 
  onChange, 
  maxConnections = 4, 
  bandwidthOptions = [], 
  unit = 'Mbps' 
}) {
  // Ajouter une nouvelle connexion
  const handleAdd = () => {
    if (value.length >= maxConnections) {
      alert(`Maximum ${maxConnections} liaisons autorisées`);
      return;
    }
    onChange([...value, { bandwidth: '', description: '' }]);
  };

  // Supprimer une connexion
  const handleRemove = (index) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  // Modifier une connexion
  const handleChange = (index, field, val) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [field]: val };
    onChange(newValue);
  };

  // S'assurer qu'il y a au moins un champ si demandé
  const items = value.length > 0 ? value : [];

  return (
    <div className="col-span-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Maximum {maxConnections} liaison{maxConnections > 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={value.length >= maxConnections}
          className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une liaison
        </button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Liaison {index + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg
                           transition-colors duration-200"
                  title="Supprimer cette liaison"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-1 gap-3">
                {/* Select de débit */}
                <div className="group">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Débit ({unit})
                  </label>
                  <div className="relative">
                    <select
                      value={item.bandwidth}
                      onChange={(e) => handleChange(index, 'bandwidth', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg
                               text-sm text-gray-900
                               focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20
                               transition-all duration-200 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionner le débit</option>
                      {bandwidthOptions.map((bw) => (
                        <option key={bw} value={bw}>
                          {bw} {unit}
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
              </div>

              {/* Badge de résumé */}
              {item.bandwidth && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Débit configuré:
                    </span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                      {item.bandwidth} {unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Wifi className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">
            Aucune liaison configurée
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Cliquez sur "Ajouter une liaison" pour commencer
          </p>
        </div>
      )}

      {/* Compteur */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
        <span>
          {items.length} / {maxConnections} liaison{maxConnections > 1 ? 's' : ''}
        </span>
        {items.length >= maxConnections && (
          <span className="text-orange-600 font-medium">
            Limite atteinte
          </span>
        )}
      </div>
    </div>
  );
}