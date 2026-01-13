import React from 'react';
import InputNumber from './InputNumber';
import InputText from './InputText';
import SelectField from './SelectField';
import LicensesField from './LicensesField';
import LicensesOfficeField from './LicensesOfficeField';
import ConnectionsField from './ConnectionsField';
import VmsField from './VMsField';
import { Plus, Trash2, Server } from 'lucide-react';

export default function DynamicField({ field, value, onChange }) {
  const commonProps = {
    label: field.label,
    name: field.name,
    value: value,
    onChange: onChange
  };

  switch (field.type) {
    case 'number':
      return <InputNumber {...commonProps} step={field.step || "1"} min={field.min} />;

    case 'text':
      return <InputText {...commonProps} />;

    case 'select':
      {
        const options = [
          { value: '', label: `Sélectionner ${field.label.toLowerCase()}` },
          ...(field.options || []).map(opt => ({
            value: opt,
            label: opt
          }))
        ];
        return <SelectField {...commonProps} options={options} />;
      }

    case 'checkbox':
      return (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            id={field.name}
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
          />
          <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
            {field.label}
          </label>
        </div>
      );

    case 'vms':
      return (
        <VmsField
          {...commonProps}
          vmFields={field.vmFields}
        />
      );

    case 'licenses':
      return (
        <LicensesField
          {...commonProps}
          licenses={field.licenses}
        />
      );

    case 'licenses_office':
      return (
        <LicensesOfficeField
          {...commonProps}
          licenses={field.licenses}
        />
      );

    case 'connections':
      return (
        <ConnectionsField
          {...commonProps}
          maxConnections={field.maxConnections}
          bandwidthOptions={field.bandwidthOptions}
          unit={field.unit}
        />
      );

    case 'racks':
      {
        const racks = Array.isArray(value) ? value : [];

        const addRack = () => {
          const newRack = {};
          field.fields.forEach(f => {
            newRack[f.name] = '';
          });
          onChange([...racks, newRack]);
        };

        const removeRack = (index) => {
          const updated = racks.filter((_, i) => i !== index);
          onChange(updated);
        };

        const updateRack = (index, fieldName, val) => {
          const updated = [...racks];
          updated[index] = { ...updated[index], [fieldName]: val };
          onChange(updated);
        };

        return (
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-500" />
              {field.label}
            </label>
            <div className="space-y-3">
              {racks.map((rack, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      Rack {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeRack(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {field.fields.map(subField => (
                      <InputText
                        key={subField.name}
                        label={subField.label}
                        type={subField.type}
                        step={subField.step}
                        min={subField.min}
                        value={rack[subField.name] || ''}
                        onChange={(val) => updateRack(index, subField.name, val)}
                        placeholder={`Ex: ${subField.type === 'number' ? '1' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addRack}
                className="w-full py-3 border-2 border-dashed border-purple-300 rounded-xl
                     text-purple-600 hover:border-purple-500 hover:text-purple-700
                     hover:bg-purple-50 
                     transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Ajouter un rack
              </button>
            </div>
          </div>
        );
      }

    case 'textarea': {
      return (
        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
          </label>
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-4 py-3 bg-white border border-gray-300 
                   rounded-xl text-gray-900  placeholder-gray-400
                   focus:ring-2 focus:ring-orange-500 focus:border-transparent
                   transition-all duration-200 resize-none"
          />
        </div>
      );
    }

    default:
      return <InputText {...commonProps} />;
  }
}
