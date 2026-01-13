import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    RefreshCw,
    Plus,
    X,
    Search,
    Filter,
    Check,
    Edit,
    Trash2,
    Shield
} from 'lucide-react';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

export default function PriceListSOC() {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterService, setFilterService] = useState('');
    const [prices, setPrices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Liste des services SOC pour le filtre
    const socServices = [
        { value: 'pack_essential', label: 'Pack Essential' },
        { value: 'pack_monitor', label: 'Pack Monitor' },
        { value: 'pack_360', label: 'Pack Secure 360' },
        { value: 'scan_vulnerability', label: 'Scan de Vulnérabilité' },
        { value: 'pentest', label: 'Test d\'Intrusion' },
        { value: 'audit_security', label: 'Audit de Sécurité' },
        { value: 'formation', label: 'Formation' },
        { value: 'supervision_h24', label: 'Supervision H24' }
    ];

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth('soc/pricing/');
            const data = await response.json();
            setPrices(data);
        } catch (error) {
            console.error('Erreur lors du chargement des prix:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setCurrentItem({
            key: '',
            name: '',
            value: '',
            unit: 'unit',
            currency: 'FCFA',
            is_active: true,
            category_name: 'Pack SOC',
            solution: 'global'
        });
        setEditMode(false);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            const response = await fetchWithAuth(`soc/pricing/${itemToDelete.id}/`, {
                method: 'DELETE'
            });

            if (response.ok || response.status === 204) {
                showSuccessMessage('Prix supprimé avec succès');
                fetchPrices();
                setShowDeleteModal(false);
                setItemToDelete(null);
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion au serveur');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const method = editMode ? 'PUT' : 'POST';
        const url = editMode
            ? `soc/pricing/${currentItem.id}/`
            : 'soc/pricing/';

        try {
            const response = await fetchWithAuth(url, {
                method,
                body: JSON.stringify(currentItem)
            });

            if (response.ok) {
                showSuccessMessage(editMode ? 'Prix modifié avec succès' : 'Prix créé avec succès');
                fetchPrices();
                setShowModal(false);
                setCurrentItem(null);
            } else {
                const errorData = await response.json();
                alert(`Erreur: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion au serveur');
        }
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const getFilteredPrices = () => {
        let filtered = [...prices];

        // Filtre par recherche
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.key?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtre par service
        if (filterService) {
            filtered = filtered.filter(item =>
                item.key?.toLowerCase().includes(filterService.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredPrices = getFilteredPrices();

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Success Message */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top">
                        <Check className="w-6 h-6" />
                        <span className="font-medium">{successMessage}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                            Gestion des Prix SOC
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Configuration des tarifs cybersécurité
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchPrices}
                        className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                                 rounded-xl border border-gray-200 dark:border-gray-700
                                 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 
                                 flex items-center gap-2 shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </button>
                    <button
                        onClick={handleAdd}
                        className="bg-gradient-to-r from-red-500 to-red-600 
                                 text-white px-6 py-3 rounded-xl hover:from-red-600 
                                 hover:to-red-700 transition-all duration-200 
                                 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-5 h-5" />
                        Ajouter un prix
                    </button>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Recherche */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un prix..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:border-red-500 focus:ring-4 focus:ring-red-500/20 
                                     outline-none transition-all duration-200"
                        />
                    </div>

                    {/* Filtre par service */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <select
                            value={filterService}
                            onChange={(e) => setFilterService(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:border-red-500 focus:ring-4 focus:ring-red-500/20 
                                     outline-none appearance-none cursor-pointer transition-all duration-200"
                        >
                            <option value="">Tous les services</option>
                            {socServices.map(service => (
                                <option key={service.value} value={service.value}>
                                    {service.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Reset */}
                    {(searchTerm || filterService) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterService('');
                            }}
                            className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                                     rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 
                                     flex items-center justify-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredPrices.length === 0 ? (
                    <div className="text-center py-20">
                        <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Aucun prix trouvé</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Nom
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Clé
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Catégorie
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Valeur
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Unité
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredPrices.map((price) => (
                                    <tr key={price.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {price.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                {price.key}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {price.category_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {new Intl.NumberFormat('fr-FR').format(price.value)} {price.currency}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {price.unit_display || price.unit}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                price.is_active
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                            }`}>
                                                {price.is_active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(price)}
                                                    className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30
                                                             rounded-lg transition-colors duration-200"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(price)}
                                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30
                                                             rounded-lg transition-colors duration-200"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Formulaire */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                {editMode ? 'Modifier le prix' : 'Ajouter un prix'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setCurrentItem(null);
                                }}
                                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {/* Key */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Clé <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={currentItem.key}
                                    onChange={(e) => setCurrentItem({ ...currentItem, key: e.target.value })}
                                    required
                                    placeholder="SOC_PACK_360"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                                             text-gray-900 dark:text-white focus:border-red-500 focus:ring-4 focus:ring-red-500/20
                                             transition-all duration-200 outline-none"
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nom <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={currentItem.name}
                                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                                    required
                                    placeholder="Pack Secure 360"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                                             text-gray-900 dark:text-white focus:border-red-500 focus:ring-4 focus:ring-red-500/20
                                             transition-all duration-200 outline-none"
                                />
                            </div>

                            {/* Category Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Catégorie
                                </label>
                                <input
                                    type="text"
                                    value={currentItem.category_name}
                                    onChange={(e) => setCurrentItem({ ...currentItem, category_name: e.target.value })}
                                    placeholder="Pack SOC"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                                             text-gray-900 dark:text-white focus:border-red-500 focus:ring-4 focus:ring-red-500/20
                                             transition-all duration-200 outline-none"
                                />
                            </div>

                            {/* Value & Unit */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Valeur <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={Number(currentItem.value).toFixed(0)}
                                        onChange={(e) => setCurrentItem({ ...currentItem, value: e.target.value })}
                                        required
                                        placeholder="1400000"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                                                 text-gray-900 dark:text-white focus:border-red-500 focus:ring-4 focus:ring-red-500/20
                                                 transition-all duration-200 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Unité <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={currentItem.unit}
                                        onChange={(e) => setCurrentItem({ ...currentItem, unit: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                                                 text-gray-900 dark:text-white focus:border-red-500 focus:ring-4 focus:ring-red-500/20
                                                 transition-all duration-200 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="unit">Unité</option>
                                        <option value="user">Utilisateur</option>
                                        <option value="asset">Asset</option>
                                        <option value="day">Jour</option>
                                        <option value="month">Mois</option>
                                    </select>
                                </div>
                            </div>

                            {/* Active */}
                            <div>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={currentItem.is_active}
                                        onChange={(e) => setCurrentItem({ ...currentItem, is_active: e.target.checked })}
                                        className="w-5 h-5 text-red-500 rounded focus:ring-2 focus:ring-red-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Prix actif
                                    </span>
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setCurrentItem(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                                             rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600
                                             transition-all duration-200 font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white 
                                             rounded-xl hover:from-red-600 hover:to-red-700 
                                             transition-all duration-200 font-medium shadow-lg"
                                >
                                    {editMode ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Confirmer la suppression
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Cette action est irréversible
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Êtes-vous sûr de vouloir supprimer <strong>"{itemToDelete?.name}"</strong> ?
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setItemToDelete(null);
                                }}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                                         rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600
                                         transition-all duration-200 font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white 
                                         rounded-xl hover:from-red-600 hover:to-red-700 
                                         transition-all duration-200 font-medium shadow-lg"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}