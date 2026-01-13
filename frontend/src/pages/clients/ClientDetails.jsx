import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Edit, Trash2, Building2, MapPin, Mail, Phone, 
    Package, Calendar, TrendingUp, Sparkles 
} from 'lucide-react';
import API_BASE_URL from '../../utils/utils';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

export default function ClientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchClientDetails();
        fetchClientOffers();
    }, [id]);

    const fetchClientDetails = async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(`clients/${id}`);
            const data = await response.json();
            setClient(data);
        } catch (error) {
            console.error('Erreur lors du chargement du client:', error);
            alert('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const fetchClientOffers = async () => {
        try {
            const response = await fetchWithAuth(`offers/`);
            const allOffers = await response.json();
            const clientOffers = allOffers.filter(o => o.client.id === parseInt(id));
            setOffers(clientOffers);
        } catch (error) {
            console.error('Erreur lors du chargement des offres:', error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}clients/${id}/`, {
                method: 'DELETE'
            });
            if (response.ok) {
                navigate('/clients');
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion au serveur');
        }
    };

    const openDeleteModal = () => {
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des détails...</p>
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Client introuvable</p>
                    <button 
                        onClick={() => navigate('/clients')} 
                        className="mt-4 text-orange-500"
                    >
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    const lastActivity = offers.length > 0 
        ? new Date(Math.max(...offers.map(o => new Date(o.created_at)))).toLocaleDateString('fr-FR')
        : 'Aucune activité';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/clients')}
                        className="group text-gray-600 hover:text-orange-600 
                                 mb-6 flex items-center transition-all duration-200 font-medium"
                    >
                        <div className="p-2 rounded-lg group-hover:bg-orange-100 transition-colors mr-2">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Retour à la liste
                    </button>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900">
                                    {client.company}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Client #{client.id} • Créé le {new Date(client.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(`/clients/edit/${id}`)}
                                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 
                                         transition-all duration-200 flex items-center gap-2 shadow-lg"
                            >
                                <Edit className="w-5 h-5" />
                                Modifier
                            </button>
                            <button
                                onClick={openDeleteModal}
                                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 
                                         transition-all duration-200 flex items-center gap-2 shadow-lg"
                            >
                                <Trash2 className="w-5 h-5" />
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Informations principales */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-white" />
                            <h2 className="text-xl font-semibold text-white">Informations principales</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Entreprise */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-orange-100 rounded-xl">
                                    <Building2 className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">Entreprise</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {client.company || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Pays */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">Pays</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {client.country || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <Mail className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <a 
                                        href={`mailto:${client.email}`}
                                        className="text-lg font-semibold text-blue-600 hover:underline"
                                    >
                                        {client.email || 'N/A'}
                                    </a>
                                </div>
                            </div>

                            {/* Téléphone */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <Phone className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                                    <a 
                                        href={`tel:${client.phone}`}
                                        className="text-lg font-semibold text-blue-600 hover:underline"
                                    >
                                        {client.phone || 'N/A'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Statistiques */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white">Statistiques</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package className="w-5 h-5 text-orange-500" />
                                        <p className="text-sm text-gray-500">Offres créées</p>
                                    </div>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {offers.length}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-5 h-5 text-orange-500" />
                                        <p className="text-sm text-gray-500">Dernière activité</p>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {lastActivity}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions rapides */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white">Actions rapides</h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <button 
                                    onClick={() => window.location.href = `mailto:${client.email}`}
                                    className="w-full px-4 py-3 bg-blue-50 text-blue-700
                                             rounded-xl hover:bg-blue-100
                                             transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                                >
                                    <Mail className="w-5 h-5" />
                                    Envoyer un email
                                </button>
                                <button 
                                    onClick={() => window.location.href = `tel:${client.phone}`}
                                    className="w-full px-4 py-3 bg-green-50 text-green-700
                                             rounded-xl hover:bg-green-100 
                                             transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                                >
                                    <Phone className="w-5 h-5" />
                                    Appeler
                                </button>
                                <button 
                                    onClick={() => navigate(`/cloud/offer/add?client_id=${id}`)}
                                    className="w-full px-4 py-3 bg-orange-50 text-orange-700
                                             rounded-xl hover:bg-orange-100
                                             transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                                >
                                    <Package className="w-5 h-5" />
                                    Créer une offre
                                </button>
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
                                Êtes-vous sûr de vouloir supprimer le client{' '}
                                <strong>"{client.company}"</strong> ?
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={closeDeleteModal}
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