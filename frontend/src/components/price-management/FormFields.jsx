import FormField from './FormField.jsx';

export default function FormFields({ activeTab, item, categories, onChange }) {
    const renderFields = () => {
        switch (activeTab) {
            case 'prices':
                return (
                    <>
                        <FormField label="Catégorie" required>
                            <select
                                value={item.category}
                                onChange={(e) => onChange('category', e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            >
                                <option value="">Sélectionner une catégorie</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label="Solution" required>
                            <select
                                value={item.solution}
                                onChange={(e) => onChange('solution', e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            >
                                <option value="global">Global</option>
                                <option value="vmware">VMware</option>
                                <option value="huawei">Huawei</option>
                                <option value="staas">STaaS</option>
                                <option value="baas">BaaS</option>
                                <option value="draas">DRaaS</option>
                                <option value="office365">Office 365</option>
                                <option value="colocation">Colocation</option>
                                <option value="connectivity">Connectivité</option>
                            </select>
                        </FormField>

                        <FormField label="Clé" required>
                            <input
                                type="text"
                                value={item.key}
                                onChange={(e) => onChange('key', e.target.value)}
                                required
                                placeholder="PRICE_VCPU"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="Nom" required>
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => onChange('name', e.target.value)}
                                required
                                placeholder="Prix par vCPU"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="Description">
                            <textarea
                                value={item.description}
                                onChange={(e) => onChange('description', e.target.value)}
                                rows={3}
                                placeholder="Description du prix..."
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl resize-none"
                            />
                        </FormField>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Valeur" required>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={item.value}
                                    onChange={(e) => onChange('value', e.target.value)}
                                    required
                                    placeholder="3800.00"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                                />
                            </FormField>

                            <FormField label="Unité" required>
                                <select
                                    value={item.unit}
                                    onChange={(e) => onChange('unit', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                                >
                                    <option value="unit">Unité</option>
                                    <option value="gb">Go</option>
                                    <option value="tb">To</option>
                                    <option value="vcpu">vCPU</option>
                                    <option value="user">Utilisateur</option>
                                    <option value="vm">VM</option>
                                    <option value="day">Jour</option>
                                    <option value="month">Mois</option>
                                    <option value="mbps">Mbps</option>
                                    <option value="kwh">kW/h</option>
                                    <option value="u">U (rack)</option>
                                    <option value="point">Point</option>
                                    <option value="percent">Pourcentage</option>
                                </select>
                            </FormField>
                        </div>

                        <FormField label="Date effective">
                            <input
                                type="date"
                                value={item.effective_from}
                                onChange={(e) => onChange('effective_from', e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={item.is_active}
                                    onChange={(e) => onChange('is_active', e.target.checked)}
                                    className="w-5 h-5 text-orange-500 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Prix actif
                                </span>
                            </label>
                        </FormField>
                    </>
                );

            case 'categories':
                return (
                    <>
                        <FormField label="Nom" required>
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => onChange('name', e.target.value)}
                                required
                                placeholder="Infrastructure Cloud"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="Code" required>
                            <input
                                type="text"
                                value={item.code}
                                onChange={(e) => onChange('code', e.target.value)}
                                required
                                placeholder="infra_cloud"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="Description">
                            <textarea
                                value={item.description}
                                onChange={(e) => onChange('description', e.target.value)}
                                rows={3}
                                placeholder="Description de la catégorie..."
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl resize-none"
                            />
                        </FormField>

                        <FormField label="Ordre">
                            <input
                                type="number"
                                value={item.order}
                                onChange={(e) => onChange('order', e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={item.is_active}
                                    onChange={(e) => onChange('is_active', e.target.checked)}
                                    className="w-5 h-5 text-orange-500 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Catégorie active
                                </span>
                            </label>
                        </FormField>
                    </>
                );

            case 'exchange-rates':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Devise source" required>
                                <select
                                    value={item.source_currency}
                                    onChange={(e) => onChange('source_currency', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                                >
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                </select>
                            </FormField>

                            <FormField label="Devise cible" required>
                                <input
                                    type="text"
                                    value={item.target_currency}
                                    onChange={(e) => onChange('target_currency', e.target.value)}
                                    required
                                    placeholder="FCFA"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                                />
                            </FormField>
                        </div>

                        <FormField label="Taux" required>
                            <input
                                type="number"
                                step="0.0001"
                                value={item.rate}
                                onChange={(e) => onChange('rate', e.target.value)}
                                required
                                placeholder="655.9570"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="Date effective">
                            <input
                                type="date"
                                value={item.effective_from}
                                onChange={(e) => onChange('effective_from', e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="Notes">
                            <textarea
                                value={item.notes}
                                onChange={(e) => onChange('notes', e.target.value)}
                                rows={3}
                                placeholder="Notes sur le taux..."
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl resize-none"
                            />
                        </FormField>

                        <FormField label="">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={item.is_active}
                                    onChange={(e) => onChange('is_active', e.target.checked)}
                                    className="w-5 h-5 text-orange-500 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Taux actif
                                </span>
                            </label>
                        </FormField>
                    </>
                );

            case 'veeam-licenses':
                return (
                    <>
                        <FormField label="Type de licence" required>
                            <input
                                type="text"
                                value={item.license_type}
                                onChange={(e) => onChange('license_type', e.target.value)}
                                required
                                placeholder="backup_replication_enterprise_plus"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="Label" required>
                            <input
                                type="text"
                                value={item.label}
                                onChange={(e) => onChange('label', e.target.value)}
                                required
                                placeholder="Veeam Backup & Replication Enterprise Plus"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Unité" required>
                                <select
                                    value={item.unit}
                                    onChange={(e) => onChange('unit', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                                >
                                    <option value="VM">VM</option>
                                    <option value="Workstation">Workstation</option>
                                    <option value="Server">Server</option>
                                    <option value="Instance">Instance</option>
                                    <option value="Poste">Poste</option>
                                    <option value="TB">TB</option>
                                    <option value="Utilisateur">Utilisateur</option>
                                    <option value="Pack de 10 users">Pack de 10 users</option>
                                    <option value="Nœud">Nœud</option>
                                </select>
                            </FormField>

                            <FormField label="Points" required>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={item.points}
                                    onChange={(e) => onChange('points', e.target.value)}
                                    required
                                    placeholder="11.00"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                                />
                            </FormField>
                        </div>

                        <FormField label="Ordre">
                            <input
                                type="number"
                                value={item.order}
                                onChange={(e) => onChange('order', e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={item.is_active}
                                    onChange={(e) => onChange('is_active', e.target.checked)}
                                    className="w-5 h-5 text-orange-500 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Licence active
                                </span>
                            </label>
                        </FormField>
                    </>
                );

            case 'office365-products':
                return (
                    <>
                        <FormField label="ID Produit" required>
                            <input
                                type="text"
                                value={item.product_id}
                                onChange={(e) => onChange('product_id', e.target.value)}
                                required
                                placeholder="CFQ7TTC0LH18"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="Nom" required>
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => onChange('name', e.target.value)}
                                required
                                placeholder="Microsoft 365 Business Basic"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="Prix USD/an" required>
                            <input
                                type="number"
                                step="0.01"
                                value={item.price_usd_annual}
                                onChange={(e) => onChange('price_usd_annual', e.target.value)}
                                required
                                placeholder="49.90"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="Unité" required>
                            <input
                                type="text"
                                value={item.unit}
                                onChange={(e) => onChange('unit', e.target.value)}
                                required
                                placeholder="utilisateur"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="Ordre">
                            <input
                                type="number"
                                value={item.order}
                                onChange={(e) => onChange('order', e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={item.is_active}
                                    onChange={(e) => onChange('is_active', e.target.checked)}
                                    className="w-5 h-5 text-orange-500 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Produit actif
                                </span>
                            </label>
                        </FormField>
                    </>
                );

            case 'bandwidth-prices':
                return (
                    <>
                        <FormField label="Type de connexion" required>
                            <select
                                value={item.bandwidth_type}
                                onChange={(e) => onChange('bandwidth_type', e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            >
                                <option value="internet">Internet</option>
                                <option value="ip_mpls">IP MPLS</option>
                            </select>
                        </FormField>

                        <FormField label="Débit (Mbps)" required>
                            <input
                                type="number"
                                value={item.bandwidth_mbps}
                                onChange={(e) => onChange('bandwidth_mbps', e.target.value)}
                                required
                                placeholder="10"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="Prix (FCFA)" required>
                            <input
                                type="number"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => onChange('price', e.target.value)}
                                required
                                placeholder="960000.00"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                            />
                        </FormField>

                        <FormField label="">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={item.is_active}
                                    onChange={(e) => onChange('is_active', e.target.checked)}
                                    className="w-5 h-5 text-orange-500 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Tarif actif
                                </span>
                            </label>
                        </FormField>
                    </>
                );

            default:
                return null;
        }
    };

    return <div className="space-y-4">{renderFields()}</div>;
}