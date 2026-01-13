import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Eye, Edit, FileSpreadsheet, Trash2, X, Clock, XCircle, CheckCircle, Shield } from 'lucide-react';
import { fetchWithAuth } from '../../utils/fetchWithAuth';
import { useAuth } from '../../context/AuthContext';

export default function OfferListSOC() {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [filteredOffers, setFilteredOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [includeAbandoned, setIncludeAbandoned] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [offerToDelete, setOfferToDelete] = useState(null);
    const [statuses, setStatuses] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchOffers();
        fetchStatuses();
    }, [includeAbandoned]);

    useEffect(() => {
        filterOffers();
    }, [searchTerm, filterStatus, offers]);

    const fetchStatuses = async () => {
        try {
            const response = await fetchWithAuth('offers/statuses/');
            const data = await response.json();
            setStatuses(data);
        } catch (error) {
            console.error('Erreur lors du chargement des statuts:', error);
        }
    };

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const url = includeAbandoned ? 'soc/?include_abandoned=true' : 'soc/';
            const response = await fetchWithAuth(url);
            const data = await response.json();
            const offersData = data.results || data;
            console.log('Données des offres SOC reçues:', offersData);
            if (Array.isArray(offersData)) {
                setOffers(offersData);
                setFilteredOffers(offersData);
            } else {
                console.error('Les données reçues ne sont pas un tableau:', offersData);
                setOffers([]);
                setFilteredOffers([]);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des offres:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterOffers = () => {
        let filtered = [...offers];

        if (searchTerm) {
            filtered = filtered.filter(offer =>
                offer.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                offer.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus) {
            filtered = filtered.filter(offer => offer.status === filterStatus);
        }

        setFilteredOffers(filtered);
    };

    const handleExportExcel = async (offerId) => {
        try {
            const response = await fetchWithAuth(`soc/${offerId}/download_excel/`, {
                method: 'GET'
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `offre_soc_${offerId}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                alert('Erreur lors de l\'export du fichier');
            }
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            alert('Erreur lors de l\'export du fichier');
        }
    };

    const handleDelete = async () => {
        if (!offerToDelete) return;

        try {
            const response = await fetchWithAuth(`soc/${offerToDelete.id}/`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setOffers(offers.filter(o => o.id !== offerToDelete.id));
                setShowDeleteModal(false);
                setOfferToDelete(null);
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion au serveur');
        }
    };

    const openDeleteModal = (offer) => {
        setOfferToDelete(offer);
        setShowDeleteModal(true);
    };

    const getStatusBadge = (status) => {
        const configs = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                icon: Clock
            },
            won: {
                color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                icon: CheckCircle
            },
            abandoned: {
                color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                icon: XCircle
            }
        };
        return configs[status] || configs.pending;
    };

    const getStatusLabel = (status) => {
        const statusObj = statuses.find(s => s.value === status);
        return statusObj ? statusObj.label : status;
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Offres Cybersécurité</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{filteredOffers.length} offre(s) SOC disponible(s)</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/soc/offer/add")}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl 
                             hover:from-red-600 hover:to-red-700 transition-all duration-200 
                             flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                    <Plus className="w-5 h-5" />
                    Créer une offre SOC
                </button>
            </div>

            {/* Filtres */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une offre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:border-red-500 focus:ring-4 focus:ring-red-500/20 
                                     outline-none transition-all duration-200"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:border-red-500 focus:ring-4 focus:ring-red-500/20 
                                     outline-none appearance-none cursor-pointer transition-all duration-200"
                        >
                            <option value="">Tous les statuts</option>
                            {statuses.map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    {(searchTerm || filterStatus) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('');
                            }}
                            className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                                     rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 
                                     flex items-center justify-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            Réinitialiser
                        </button>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeAbandoned}
                                onChange={(e) => setIncludeAbandoned(e.target.checked)}
                                className="w-5 h-5 text-red-500 rounded focus:ring-2 focus:ring-red-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Inclure les offres abandonnées
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredOffers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-gray-400 mb-4">
                            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">Aucune offre trouvée</p>
                            <p className="text-sm mt-2">Essayez de modifier vos critères de recherche</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                                <tr>
                                    {user.is_admin === true && (
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Créé par
                                        </th>
                                    )}
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Objet
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Total TTC
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredOffers.slice().sort((a, b) => b.id - a.id).map((offer) => {
                                    const statusConfig = getStatusBadge(offer.status);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <tr
                                            key={offer.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                        >
                                            {user.is_admin === true && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {offer.business_developer?.full_name || 'N/A'}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {offer.subject || 'Sans titre'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {offer.client_name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                    {getStatusLabel(offer.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {offer.total_ttc
                                                        ? new Intl.NumberFormat('fr-FR').format(offer.total_ttc) + ' FCFA'
                                                        : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {offer.created_at ? new Date(offer.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/soc/offer/${offer.id}`)}
                                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 
                                                                 rounded-lg transition-colors duration-200"
                                                        title="Voir les détails"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/soc/offer/edit/${offer.id}`)}
                                                        className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 
                                                                 rounded-lg transition-colors duration-200"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleExportExcel(offer.id)}
                                                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20
                                                                 rounded-lg transition-colors duration-200"
                                                        title="Exporter vers Excel"
                                                    >
                                                        <FileSpreadsheet className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(offer)}
                                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
                                                                 rounded-lg transition-colors duration-200"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
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
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Êtes-vous sûr de vouloir supprimer l'offre <strong>"{offerToDelete?.subject}"</strong> ?
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setOfferToDelete(null);
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