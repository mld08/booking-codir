import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Edit, FileSpreadsheet, Trash2, Building2, User,
    Cloud, Server, HardDrive, Cpu, Database, Network, Shield,
    TrendingUp, Calendar, Package, Zap, CheckCircle, Clock, XCircle, RefreshCw
} from 'lucide-react';
import DetailCard from '../../components/cloud/DetailCard';
import API_BASE_URL from '../../utils/utils';
import { getSolutionFields, getSolutionOptions } from '../../config/solutionFields';
import { OFFICE_LICENSES } from '../../config/solutionFields';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

export default function OfferDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [statuses, setStatuses] = useState([]); // NOUVEAU
    const [updatingStatus, setUpdatingStatus] = useState(false); // NOUVEAU

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
            //const response = await fetch(`${API_BASE_URL}offers/${id}`);
            const response = await fetchWithAuth(`offers/${id}/`);
            const data = await response.json();
            setOffer(data);
            console.log('Détails de l\'offre:', data);
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
            const response = await fetchWithAuth(`offers/${id}/update_status/`, {
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
            const response = await fetchWithAuth(`offers/${id}/download_excel/`, {
                method: 'GET'
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `offre_${id}.xlsx`;
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
            const response = await fetchWithAuth(`offers/${id}/`, {
                method: 'DELETE'
            });

            if (response.ok) {
                navigate('/cloud/offer');
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion au serveur');
        }
    };

    const getSolutionBadge = (solution) => {
        const colors = {
            vmware: 'bg-blue-100 text-blue-800',
            huawei: 'bg-red-100 text-red-800',
            staas: 'bg-purple-100 text-purple-800',
            baas: 'bg-green-100 text-green-800',
            draas: 'bg-yellow-100 text-yellow-800',
            office365: 'bg-indigo-100 text-indigo-800',
            colocation: 'bg-gray-100 text-gray-800',
            aws: 'bg-orange-100 text-orange-800'
        };
        return colors[solution] || 'bg-gray-100 text-gray-800';
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                icon: Clock,
                label: 'En attente'
            },
            won: {
                color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                icon: CheckCircle,
                label: 'Gagné'
            },
            abandoned: {
                color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                icon: XCircle,
                label: 'Abandonné'
            }
        };
        return configs[status] || configs.pending;
    };

    // Fonction pour formater la valeur selon le type de champ
    const formatValue = (field, value) => {
        if (value === null || value === undefined || value === '') return 'N/A';

        if (field.type === 'checkbox') {
            return value ? 'Oui' : 'Non';
        }

        if (field.type === 'licenses') {
            return Array.isArray(value) ? `${value.length} licence(s)` : 'Aucune';
        }

        if (field.type === 'connections') {
            return Array.isArray(value) ? `${value.length} liaison(s)` : 'Aucune';
        }

        if (field.type === 'racks') {
            return Array.isArray(value) ? `${value.length} rack(s)` : 'Aucun';
        }

        // Si le label contient "Go" ou des unités, ne pas les rajouter
        if (field.label.includes('(') && field.label.includes(')')) {
            return value;
        }

        return value;
    };

    // Fonction pour afficher les VMS Huawei et VMware
    const VmsDisplay = ({ vms, solution }) => {
        if (!Array.isArray(vms) || vms.length === 0) {
            return <p className="text-gray-500 text-sm">Aucune VM configurée</p>;
        }
        return (
            <div className="space-y-4">
                {vms.map((vm, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 ">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                                <Server className="w-5 h-5" />
                                VM {index + 1}: {vm.name || 'Sans nom'}
                            </h4>
                            {vm.quantity && vm.quantity > 1 && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                    x{vm.quantity}
                                </span>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Processeurs */}
                            {(vm.vcpu !== undefined && vm.vcpu !== null && vm.vcpu !== 0) && (
                                <DetailCard
                                    icon={Cpu}
                                    label="vCPU"
                                    value={vm.vcpu}
                                />
                            )}
                            {(vm.vgpu !== undefined && vm.vgpu !== null && vm.vgpu !== 0) && (
                                <DetailCard
                                    icon={Cpu}
                                    label="vGPU"
                                    value={vm.vgpu}
                                />
                            )}

                            {/* RAM */}
                            {(vm.ram_gb !== undefined && vm.ram_gb !== null && vm.ram_gb !== 0) && (
                                <DetailCard
                                    icon={HardDrive}
                                    label="RAM (Go)"
                                    value={vm.ram_gb}
                                />
                            )}

                            {/* Stockage */}
                            {(vm.storage_gb_ssd !== undefined && vm.storage_gb_ssd !== null && vm.storage_gb_ssd !== 0) && (
                                <DetailCard
                                    icon={Database}
                                    label="Stockage SSD (Go)"
                                    value={vm.storage_gb_ssd}
                                />
                            )}
                            {(vm.storage_gb_hdd !== undefined && vm.storage_gb_hdd !== null && vm.storage_gb_hdd !== 0) && (
                                <DetailCard
                                    icon={Database}
                                    label="Stockage HDD (Go)"
                                    value={vm.storage_gb_hdd}
                                />
                            )}

                            {/* OS Windows */}
                            {(vm.os_win_server_8 !== undefined && vm.os_win_server_8 !== null && vm.os_win_server_8 !== 0) && (
                                <DetailCard
                                    icon={Server}
                                    label="OS Windows (8 Cœurs)"
                                    value={vm.os_win_server_8}
                                />
                            )}
                            {(vm.os_win_server_12 !== undefined && vm.os_win_server_12 !== null && vm.os_win_server_12 !== 0) && (
                                <DetailCard
                                    icon={Server}
                                    label="OS Windows (12 Cœurs)"
                                    value={vm.os_win_server_12}
                                />
                            )}

                            {/* Réseau */}
                            {(vm.ip_address !== undefined && vm.ip_address !== null && vm.ip_address !== 0) && (
                                <DetailCard
                                    icon={Network}
                                    label="Adresse IP Publique V4"
                                    value={vm.ip_address}
                                />
                            )}
                            {(vm.vpn_site !== undefined && vm.vpn_site !== null && vm.vpn_site !== 0) && (
                                <DetailCard
                                    icon={Shield}
                                    label="Tunnel VPN Site to Site"
                                    value={vm.vpn_site}
                                />
                            )}

                            {/* Sauvegarde (Huawei uniquement) */}
                            {solution === 'huawei' && (vm.backup_vm_csbs_gb !== undefined && vm.backup_vm_csbs_gb !== null && vm.backup_vm_csbs_gb !== 0) && (
                                <DetailCard
                                    icon={Database}
                                    label="Sauvegarde VM (CSBS) en Go"
                                    value={vm.backup_vm_csbs_gb}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Fonction pour afficher les licences VEEAM
    const LicensesDisplay = ({ licenses }) => {
        if (!Array.isArray(licenses) || licenses.length === 0) {
            return <p className="text-gray-500 text-sm">Aucune licence</p>;
        }

        return (
            <div className="space-y-2">
                {licenses.map((license, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 ">
                        <span className="text-sm font-medium text-gray-700 ">
                            {license.license_type || license.label}
                        </span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                            x{license.quantity}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    // Fonction pour afficher les licences OFFICE
    const LicensesOfficeDisplay = ({ licenses }) => {
        if (!Array.isArray(licenses) || licenses.length === 0) {
            return <p className="text-gray-500 text-sm">Aucune licence</p>;
        }

        return (
            <div className="space-y-2">
                {licenses.map((license, index) => {

                    // On cherche la licence correspondante via le product_id
                    const matchedLicense = OFFICE_LICENSES.find(item => item.value === license.product_id);

                    return (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <span className="text-sm font-medium text-gray-700">
                                {matchedLicense ? matchedLicense.label : license.product_id}
                            </span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                                x{license.quantity}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Fonction pour afficher les connexions (Internet/IP)
    const ConnectionsDisplay = ({ connections, label, unit = 'Mbps' }) => {
        if (!Array.isArray(connections) || connections.length === 0) {
            return <p className="text-gray-500 text-sm">Aucune liaison configurée</p>;
        }

        return (
            <div className="space-y-2">
                {connections.map((connection, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Network className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-700">
                                    Liaison {index + 1}
                                </span>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                            {connection.bandwidth} {unit}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    // Fonction pour afficher les racks (NOUVEAU)
    const RacksDisplay = ({ racks }) => {
        if (!Array.isArray(racks) || racks.length === 0) {
            return <p className="text-gray-500 text-sm">Aucun rack configuré</p>;
        }

        return (
            <div className="space-y-3">
                {racks.map((rack, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Server className="w-4 h-4 text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-purple-900">
                                    Rack {index + 1}
                                </h4>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {rack.space_u && (
                                <div className="bg-white rounded-lg p-3 border border-purple-200">
                                    <p className="text-xs text-gray-500 mb-1">Espace</p>
                                    <p className="text-lg font-bold text-purple-900 flex items-center gap-2">
                                        <Server className="w-4 h-4" />
                                        {rack.space_u} U
                                    </p>
                                </div>
                            )}
                            {rack.power_kwh && (
                                <div className="bg-white rounded-lg p-3 border border-purple-200">
                                    <p className="text-xs text-gray-500 mb-1">Puissance</p>
                                    <p className="text-lg font-bold text-purple-900 flex items-center gap-2">
                                        <Zap className="w-4 h-4" />
                                        {rack.power_kwh} kW
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Résumé total */}
                <div className="p-4 bg-purple-100 rounded-xl border-2 border-purple-300">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-purple-700 mb-1">Total Espace</p>
                            <p className="text-2xl font-bold text-purple-900">
                                {racks.reduce((sum, rack) => sum + (Number(rack.space_u) || 0), 0)} U
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-purple-700 mb-1">Total Puissance</p>
                            <p className="text-2xl font-bold text-purple-900">
                                {racks.reduce((sum, rack) => sum + (Number(rack.power_kwh) || 0), 0).toFixed(1)} kW
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
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

    if (!offer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Offre introuvable</p>
                    <button onClick={() => navigate('/cloud/offer')} className="mt-4 text-orange-500 hover:text-orange-600">
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    // Obtenir les champs spécifiques à cette solution
    const solutionFields = getSolutionFields(offer.solution);
    const solutionOptions = getSolutionOptions(offer.solution);

    const specificFields = solutionFields.filter(f =>
        !['service_days', 'margin_percentage'].includes(f.name)
    );

    const statusConfig = getStatusConfig(offer.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/cloud/offer')}
                        className="group text-gray-600 hover:text-orange-600 
                                 mb-6 flex items-center transition-all duration-200 font-medium"
                    >
                        <div className="p-2 rounded-lg group-hover:bg-orange-100 transition-colors mr-2">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Retour aux offres
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                                <Package className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-bold text-gray-900">
                                        {offer.subject}
                                    </h1>
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getSolutionBadge(offer.solution)}`}>
                                        {offer.solution?.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-gray-600">
                                    Offre #{offer.id} • Créée le {new Date(offer.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(`/cloud/offer/edit/${id}`)}
                                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 
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
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informations générales */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center gap-3">
                                <Building2 className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">Informations générales</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Client</p>
                                        <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-orange-500" />
                                            {offer.client?.company || offer.client_name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Ingénieur</p>
                                        <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <User className="w-5 h-5 text-orange-500" />
                                            {offer.engineer
                                                ? `${offer.engineer?.full_name || ''} ${offer.engineer?.last_name || ''}`.trim()
                                                : offer.engineer.full_name || 'N/A'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Solution</p>
                                        <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Cloud className="w-5 h-5 text-orange-500" />
                                            {offer.solution?.toUpperCase() || 'N/A'}
                                        </p>
                                    </div>
                                    {offer.quantity !== undefined && offer.quantity !== null && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Quantité</p>
                                            <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                <Package className="w-5 h-5 text-orange-500" />
                                                {offer.quantity}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Caractéristiques spécifiques à la solution */}
                        {specificFields.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center gap-3">
                                    <Cloud className="w-6 h-6 text-white" />
                                    <h2 className="text-xl font-semibold text-white">
                                        Caractéristiques {offer.solution?.toUpperCase()}
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-6">
                                        {specificFields.map(field => {
                                            const value = offer[field.name];

                                            // Affichage spécial pour les licences
                                            if (field.type === 'licenses' && value) {
                                                return (
                                                    <div key={field.name}>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                            {field.label}
                                                        </h3>
                                                        <LicensesDisplay licenses={value} />
                                                    </div>
                                                );
                                            }

                                            // Affichage spécial pour les licences Microsoft 365
                                            if (field.type === 'licenses_office' && value) {
                                                return (
                                                    <div key={field.name}>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                            {field.label}
                                                        </h3>
                                                        <LicensesOfficeDisplay licenses={value} />
                                                    </div>
                                                );
                                            }

                                            // Affichage spécial pour les connexions
                                            if (field.type === 'connections' && value) {
                                                return (
                                                    <div key={field.name}>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                            {field.label}
                                                        </h3>
                                                        <ConnectionsDisplay
                                                            connections={value}
                                                            label={field.label}
                                                            unit={field.unit}
                                                        />
                                                    </div>
                                                );
                                            }

                                            // Affichage spécial pour les racks
                                            if (field.type === 'racks' && value) {
                                                return (
                                                    <div key={field.name}>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                            <Server className="w-5 h-5 text-purple-500" />
                                                            {field.label}
                                                        </h3>
                                                        <RacksDisplay racks={value} />
                                                    </div>
                                                );
                                            }

                                            // Affichage spécial pour les VMS Huawei et VMware
                                            if ((field.type === 'vms') && value) {
                                                return (
                                                    <div key={field.name}>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                            <Server className="w-5 h-5 text-purple-500" />
                                                            {field.label}
                                                        </h3>
                                                        <VmsDisplay vms={value} solution={offer.solution} />
                                                    </div>
                                                );
                                            }

                                            // Affichage standard pour les autres champs
                                            if (value !== undefined && value !== null && value !== '' && value !== 0) {
                                                return (
                                                    <DetailCard
                                                        key={field.name}
                                                        icon={Database}
                                                        label={field.label}
                                                        value={formatValue(field, value)}
                                                    />
                                                );
                                            }

                                            return null;
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center gap-3">
                                <StatusIcon className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">Statut de l'offre</h2>
                            </div>
                            <div className="p-6">
                                {/* Statut actuel */}
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Statut actuel</p>
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-semibold ${statusConfig.color}`}>
                                        <StatusIcon className="w-5 h-5" />
                                        {statusConfig.label}
                                    </div>
                                </div>

                                {/* Changer le statut */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
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
                        {/* Marges et services */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-semibold text-white">Marges & Services</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {offer.margin_percentage !== undefined && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-sm text-gray-500 mb-1">Marge</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {offer.margin_percentage || 0}%
                                        </p>
                                    </div>
                                )}
                                {offer.service_days !== undefined && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-sm text-gray-500 mb-1">Service Days</p>
                                        <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                            <Calendar className="w-6 h-6 text-orange-500" />
                                            {offer.service_days || 0} jours
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informations supplémentaires */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
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

                        {/* Options supplémentaires */}
                        {solutionOptions.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-white" />
                                    <h2 className="text-xl font-semibold text-white">Options</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    {solutionOptions.map(option => {
                                        const value = offer[option.name];
                                        if (value !== undefined && value !== null && value !== '' && value !== 0) {
                                            return (
                                                <div key={option.name} className="bg-gray-50 rounded-xl p-4">
                                                    <p className="text-sm text-gray-500 mb-2">{option.label}</p>
                                                    {option.type === 'textarea' ? (
                                                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                                            {value}
                                                        </p>
                                                    ) : (
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            {value}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
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