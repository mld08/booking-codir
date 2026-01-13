import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Edit, FileSpreadsheet, Trash2, Building2, User,
    Shield, Package, TrendingUp, CheckCircle, Clock, XCircle, RefreshCw, Sparkles
} from 'lucide-react';
import DetailCard from '../../components/cloud/DetailCard';
import { SOC_FIELDS } from '../../config/socFields';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

export default function OfferDetailsSOC() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [statuses, setStatuses] = useState([]);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchOfferDetails();
        fetchStatuses();
    }, [id]);

    const fetchStatuses = async () => {
        try {
            const response = await fetchWithAuth('offers/statuses/');
            const data = await response.json();
            setStatuses(data);
        } catch (error) {
            console.error('Erreur lors du chargement des statuts:', error);
        }
    };

    const fetchOfferDetails = async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(`soc/${id}/`);
            const data = await response.json();
            setOffer(data);
            console.log('Détails de l\'offre SOC:', data);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'offre:', error);
            alert('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!offer || updatingStatus) return;

        try {
            setUpdatingStatus(true);
            const response = await fetchWithAuth(`soc/${id}/`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const data = await response.json();
                setOffer(prev => ({ ...prev, status: data.status }));
            } else {
                alert('Erreur lors de la mise à jour du statut');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la mise à jour du statut');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleExportExcel = async (id) => {
        try {
            const response = await fetchWithAuth(`soc/${id}/download_excel/`, {
                method: 'GET'
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `offre_soc_${id}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                alert("Erreur lors de l'export du fichier");
            }
        } catch (error) {
            console.error("Erreur lors de l'export:", error);
            alert("Erreur lors de l'export du fichier");
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetchWithAuth(`soc/${id}/`, {
                method: 'DELETE'
            });

            if (response.ok) {
                navigate('/soc/offers');
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion au serveur');
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800',
                icon: Clock,
                label: 'En attente'
            },
            won: {
                color: 'bg-green-100 text-green-800',
                icon: CheckCircle,
                label: 'Gagné'
            },
            abandoned: {
                color: 'bg-red-100 text-red-800',
                icon: XCircle,
                label: 'Abandonné'
            }
        };
        return configs[status] || configs.pending;
    };

    // Fonction helper pour formater les valeurs
    const formatValue = (value, type) => {
        if (value === null || value === undefined || value === '') return 'Non';
        if (type === 'boolean') return value ? 'Oui' : 'Non';
        if (type === 'number') return value;
        return value;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des détails...</p>
                </div>
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Offre introuvable</p>
                    <button onClick={() => navigate('/soc/offers')} className="mt-4 text-red-500 hover:text-red-600">
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(offer.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/soc/offers')}
                        className="group text-gray-600 hover:text-red-600
                                 mb-6 flex items-center transition-all duration-200 font-medium"
                    >
                        <div className="p-2 rounded-lg group-hover:bg-red-100 transition-colors mr-2">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Retour aux offres
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-bold text-gray-900">
                                        {offer.subject}
                                    </h1>
                                </div>
                                <p className="text-gray-600">
                                    Offre SOC #{offer.id} • Créée le {new Date(offer.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(`/soc/offer/edit/${id}`)}
                                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 
                                         transition-all duration-200 flex items-center gap-2 shadow-lg"
                            >
                                <Edit className="w-5 h-5" />
                                Modifier
                            </button>
                            <button
                                onClick={() => handleExportExcel(offer.id)}
                                className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 
                                         transition-all duration-200 flex items-center gap-2 shadow-lg"
                            >
                                <FileSpreadsheet className="w-5 h-5" />
                                Exporter
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 
                                         transition-all duration-200 flex items-center gap-2 shadow-lg"
                            >
                                <Trash2 className="w-5 h-5" />
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informations générales */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center gap-3">
                                <Building2 className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">Informations générales</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Client</p>
                                        <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-red-500" />
                                            {offer.client?.company || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Ingénieur</p>
                                        <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <User className="w-5 h-5 text-red-500" />
                                            {offer.engineer
                                                ? `${offer.engineer?.full_name || ''}`.trim()
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Packs Récurrents */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center gap-3">
                                <Shield className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">Packs Récurrents (Mensuel)</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {SOC_FIELDS.packs_recurrent.map(field => {
                                        const value = offer[field.name];
                                        if (field.type === 'checkbox' && value) {
                                            return (
                                                <DetailCard
                                                    key={field.name}
                                                    icon={CheckCircle}
                                                    label={field.label}
                                                    value="Activé"
                                                />
                                            );
                                        } else if (field.type === 'number' && value && !field.dependsOn) {
                                            return null;
                                        } else if (field.type === 'number' && value) {
                                            return (
                                                <DetailCard
                                                    key={field.name}
                                                    icon={Package}
                                                    label={field.label}
                                                    value={value}
                                                />
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                                {!SOC_FIELDS.packs_recurrent.some(f => offer[f.name]) && (
                                    <p className="text-gray-500 text-center py-4">
                                        Aucun pack récurrent activé
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Pack One-Shot */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">Pack One-Shot</h2>
                            </div>
                            <div className="p-6">
                                {SOC_FIELDS.packs_oneshot.map(field => {
                                    const value = offer[field.name];
                                    if (value) {
                                        return (
                                            <DetailCard
                                                key={field.name}
                                                icon={CheckCircle}
                                                label={field.label}
                                                value="Activé"
                                            />
                                        );
                                    }
                                    return null;
                                })}
                                {!SOC_FIELDS.packs_oneshot.some(f => offer[f.name]) && (
                                    <p className="text-gray-50 text-center py-4">
                                        Pack 360 non activé
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Services Additionnels */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center gap-3">
                                <Shield className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">Services Additionnels</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {SOC_FIELDS.services_additionnels.map(field => {
                                        const value = offer[field.name];
                                        if (field.type === 'checkbox' && value) {
                                            return (
                                                <DetailCard
                                                    key={field.name}
                                                    icon={CheckCircle}
                                                    label={field.label}
                                                    value="Activé"
                                                />
                                            );
                                        } else if (field.type === 'number' && value && !field.dependsOn) {
                                            return null;
                                        } else if (field.type === 'number' && value) {
                                            return (
                                                <DetailCard
                                                    key={field.name}
                                                    icon={Package}
                                                    label={field.label}
                                                    value={value}
                                                />
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                                {!SOC_FIELDS.services_additionnels.some(f => offer[f.name]) && (
                                    <p className="text-gray-500 text-center py-4">
                                        Aucun service additionnel activé
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Statut */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center gap-3">
                                <StatusIcon className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">Statut de l'offre</h2>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-2">Statut actuel</p>
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-semibold ${statusConfig.color}`}>
                                        <StatusIcon className="w-5 h-5" />
                                        {statusConfig.label}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                        Changer le statut
                                    </p>
                                    {statuses.map(status => {
                                        const config = getStatusConfig(status.value);
                                        const Icon = config.icon;
                                        const isCurrentStatus = offer.status === status.value;

                                        return (
                                            <button
                                                key={status.value}
                                                onClick={() => !isCurrentStatus && handleStatusChange(status.value)}
                                                disabled={isCurrentStatus || updatingStatus}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                                         transition-all duration-200 font-medium
                                                         ${isCurrentStatus
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : `${config.color} hover:opacity-80 cursor-pointer`
                                                    }
                                                         ${updatingStatus ? 'opacity-50 cursor-wait' : ''}`}
                                            >
                                                {updatingStatus && !isCurrentStatus ? (
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Icon className="w-5 h-5" />
                                                )}
                                                <span>{status.label}</span>
                                                {isCurrentStatus && (
                                                    <CheckCircle className="w-4 h-4 ml-auto" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Financier */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">Financier</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {offer.discount_percentage > 0 && (
                                    <div className="bg-orange-50 rounded-xl p-4">
                                        <p className="text-sm text-gray-500 mb-1">Remise</p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {offer.discount_percentage}%
                                        </p>
                                    </div>
                                )}
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500 mb-1">Total One-Shot</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {offer.one_shot_total
                                            ? new Intl.NumberFormat('fr-FR').format(offer.one_shot_total) + ' FCFA'
                                            : '0 FCFA'}
                                    </p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500 mb-1">Total Mensuel</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {offer.recurring_total
                                            ? new Intl.NumberFormat('fr-FR').format(offer.recurring_total) + ' FCFA'
                                            : '0 FCFA'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500 mb-1">TVA (18%)</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {offer.tva_amount
                                            ? new Intl.NumberFormat('fr-FR').format(offer.tva_amount) + ' FCFA'
                                            : '0 FCFA'}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4">
                                    <p className="text-sm text-white/80 mb-1">Total TTC</p>
                                    <p className="text-3xl font-bold text-white">
                                        {offer.total_ttc
                                            ? new Intl.NumberFormat('fr-FR').format(offer.total_ttc) + ' FCFA'
                                            : '0 FCFA'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Informations supplémentaires */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white">Informations</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Date de création</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date(offer.created_at).toLocaleString('fr-FR')}
                                    </p>
                                </div>
                                {offer.updated_at && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Dernière modification</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {new Date(offer.updated_at).toLocaleString('fr-FR')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
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
                                Êtes-vous sûr de vouloir supprimer l'offre <strong>"{offer.subject}"</strong> ?
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700
                                         rounded-xl hover:bg-gray-200
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