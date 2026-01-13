import React from 'react';
import { Plus, Trash2, Server } from 'lucide-react';
import InputText from './InputText';

export default function VmsField({ label, value = [], onChange, vmFields }) {
  const handleAdd = () => {
    const newVm = {};
    vmFields.forEach(field => {
      newVm[field.name] = '';
    });
    onChange([...value, newVm]);
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

  const items = value.length > 0 ? value : [{}];

  return (
    <div className="col-span-full space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      </div>

      <div className="space-y-4">
        {items.map((vm, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                <span className="text-base font-semibold text-blue-900">
                  VM {index + 1}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={items.length === 1}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg
                         transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Supprimer cette VM"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vmFields.map((field) => (
                <InputText
                  key={field.name}
                  label={field.label}
                  type="number"
                  step={field.step || "1"}
                  min="0"
                  value={vm[field.name] || ''}
                  onChange={(val) => handleChange(index, field.name, val)}
                  placeholder={field.type == "number" ? `Ex: ${field.step === '0.01' ? '0.00' : '0'}` : ''}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Ajouter des machines virtuelles (VMs)</span>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter une VM
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Server className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">
            Aucune VM configurée
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Cliquez sur "Ajouter une VM" pour commencer
          </p>
        </div>
      )}
    </div>
  );
}