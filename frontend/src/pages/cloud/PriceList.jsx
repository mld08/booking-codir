import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Layers,
    RefreshCw,
    Plus,
    X,
    Search,
    Filter,
    Euro,
    Package,
    Wifi,
    Cloud,
    Check
} from 'lucide-react';
import API_BASE_URL from '../../utils/utils';
import DataTable from '../../components/price-management/DataTable';
import FormModal from '../../components/price-management/FormModal';
import DeleteModal from '../../components/price-management/DeleteModal';

const PRICING_API = `${API_BASE_URL}pricing/`;

export default function PriceList() {
    const [activeTab, setActiveTab] = useState('prices');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSolution, setFilterSolution] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // États pour les données
    const [prices, setPrices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [exchangeRates, setExchangeRates] = useState([]);
    const [veeamLicenses, setVeeamLicenses] = useState([]);
    const [office365Products, setOffice365Products] = useState([]);
    const [bandwidthPrices, setBandwidthPrices] = useState([]);

    // États pour les modals
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const tabs = [
        { id: 'prices', label: 'Prix', icon: DollarSign, color: 'orange' },
        { id: 'categories', label: 'Catégories', icon: Layers, color: 'blue' },
        { id: 'exchange-rates', label: 'Taux de Change', icon: Euro, color: 'green' },
        { id: 'veeam-licenses', label: 'Licences Veeam', icon: Package, color: 'purple' },
        { id: 'office365-products', label: 'Office 365', icon: Cloud, color: 'indigo' },
        { id: 'bandwidth-prices', label: 'Bande Passante', icon: Wifi, color: 'blue' }
    ];

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            switch (activeTab) {
                case 'prices':
                    {
                        const pricesRes = await fetch(`${PRICING_API}prices/`);
                        const pricesData = await pricesRes.json();
                        setPrices(pricesData);
                        console.log('Prices data:', pricesData);

                        // Charger aussi les catégories pour les filtres
                        const categoriesRes = await fetch(`${PRICING_API}categories/`);
                        const categoriesData = await categoriesRes.json();
                        setCategories(categoriesData);
                        break;
                    }

                case 'categories':
                    {
                        const catRes = await fetch(`${PRICING_API}categories/`);
                        const catData = await catRes.json();
                        setCategories(catData);
                        break;
                    }

                case 'exchange-rates':
                    {
                        const ratesRes = await fetch(`${PRICING_API}exchange-rates/`);
                        const ratesData = await ratesRes.json();
                        setExchangeRates(ratesData);
                        break;
                    }

                case 'veeam-licenses':
                    {
                        const veeamRes = await fetch(`${PRICING_API}veeam-licenses/`);
                        const veeamData = await veeamRes.json();
                        setVeeamLicenses(veeamData);
                        break;
                    }

                case 'office365-products':
                    {
                        const officeRes = await fetch(`${PRICING_API}office365-products/`);
                        const officeData = await officeRes.json();
                        setOffice365Products(officeData);
                        break;
                    }

                case 'bandwidth-prices':
                    {
                        const bandwidthRes = await fetch(`${PRICING_API}bandwidth-prices/`);
                        const bandwidthData = await bandwidthRes.json();
                        setBandwidthPrices(bandwidthData);
                        break;
                    }
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setCurrentItem(getEmptyItem());
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
            const response = await fetch(`${PRICING_API}${activeTab}/${itemToDelete.id}/`, {
                method: 'DELETE'
            });

            if (response.ok || response.status === 204) {
                showSuccessMessage('Élément supprimé avec succès');
                fetchData();
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
            ? `${PRICING_API}${activeTab}/${currentItem.id}/`
            : `${PRICING_API}${activeTab}/`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentItem)
            });

            if (response.ok) {
                showSuccessMessage(editMode ? 'Élément modifié avec succès' : 'Élément créé avec succès');
                fetchData();
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

    const getEmptyItem = () => {
        switch (activeTab) {
            case 'prices':
                return {
                    category: '',
                    solution: 'global',
                    key: '',
                    name: '',
                    description: '',
                    value: '',
                    unit: 'unit',
                    currency: 'FCFA',
                    is_active: true,
                    effective_from: new Date().toISOString().split('T')[0]
                };
            case 'categories':
                return {
                    name: '',
                    code: '',
                    description: '',
                    is_active: true,
                    order: 0
                };
            case 'exchange-rates':
                return {
                    source_currency: 'EUR',
                    target_currency: 'FCFA',
                    rate: '',
                    is_active: true,
                    effective_from: new Date().toISOString().split('T')[0],
                    notes: ''
                };
            case 'veeam-licenses':
                return {
                    license_type: '',
                    label: '',
                    unit: 'VM',
                    points: '',
                    is_active: true,
                    order: 0
                };
            case 'office365-products':
                return {
                    product_id: '',
                    name: '',
                    price_usd_annual: '',
                    unit: 'utilisateur',
                    is_active: true,
                    order: 0
                };
            case 'bandwidth-prices':
                return {
                    bandwidth_type: 'internet',
                    bandwidth_mbps: '',
                    price: '',
                    is_active: true
                };
            default:
                return {};
        }
    };

    const getCurrentTab = () => tabs.find(t => t.id === activeTab);

    const getFilteredData = () => {
        let data = [];

        switch (activeTab) {
            case 'prices':
                data = prices;
                break;
            case 'categories':
                data = categories;
                break;
            case 'exchange-rates':
                data = exchangeRates;
                break;
            case 'veeam-licenses':
                data = veeamLicenses;
                break;
            case 'office365-products':
                data = office365Products;
                break;
            case 'bandwidth-prices':
                data = bandwidthPrices;
                break;
        }

        // Filtrage par recherche
        if (searchTerm) {
            data = data.filter(item => {
                const searchFields = getSearchableFields(item);
                return searchFields.some(field =>
                    field?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
        }

        // Filtrage par solution (pour les prix)
        if (activeTab === 'prices' && filterSolution) {
            data = data.filter(item => item.solution === filterSolution);
        }

        // Filtrage par catégorie (pour les prix)
        if (activeTab === 'prices' && filterCategory) {
            data = data.filter(item => item.category === Number.parseInt(filterCategory));
        }

        return data;
    };

    const getSearchableFields = (item) => {
        switch (activeTab) {
            case 'prices':
                return [item.name, item.key, item.description, item.solution];
            case 'categories':
                return [item.name, item.code, item.description];
            case 'exchange-rates':
                return [item.source_currency, item.target_currency, item.notes];
            case 'veeam-licenses':
                return [item.license_type, item.label];
            case 'office365-products':
                return [item.product_id, item.name];
            case 'bandwidth-prices':
                return [item.bandwidth_type, String(item.bandwidth_mbps)];
            default:
                return [];
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
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
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestion des Prix</h1>
                    <p className="text-gray-600 mt-1">
                        Configurez tous les tarifs de vos solutions
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-white text-gray-700 
                         rounded-xl border border-gray-200 
                         hover:bg-gray-50 transition-all duration-200 
                         flex items-center gap-2 shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </button>
                    {(activeTab === 'veeam-licenses' || activeTab === 'office365-products') && (
                        <button
                            onClick={handleAdd}
                            className={`bg-gradient-to-r from-${getCurrentTab()?.color}-500 to-${getCurrentTab()?.color}-600 
                          text-white px-6 py-3 rounded-xl hover:from-${getCurrentTab()?.color}-600 
                          hover:to-${getCurrentTab()?.color}-700 transition-all duration-200 
                          flex items-center gap-2 shadow-lg hover:shadow-xl`}
                        >
                            <Plus className="w-5 h-5" />
                            Ajouter
                        </button>
                    )}

                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg mb-6 border border-gray-100 overflow-x-auto">
                <div className="flex p-2 gap-2 min-w-max">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSearchTerm('');
                                    setFilterSolution('');
                                    setFilterCategory('');
                                }}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200
                                          ${isActive
                                        ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg`
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="whitespace-nowrap">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl 
                                     bg-white text-gray-900
                                     focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 
                                     outline-none transition-all duration-200"
                        />
                    </div>

                    {/* Filter by Solution (only for prices) */}
                    {activeTab === 'prices' && (
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                            <select
                                value={filterSolution}
                                onChange={(e) => setFilterSolution(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl 
                                             bg-white text-gray-900
                                             focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 
                                             outline-none appearance-none cursor-pointer transition-all duration-200"
                            >
                                <option value="">Toutes les solutions</option>
                                <option value="global">Global</option>
                                <option value="vmware">VMware</option>
                                <option value="huawei">Huawei</option>
                                <option value="staas">STaaS</option>
                                <option value="baas">BaaS</option>
                                <option value="colocation">Colocation</option>
                            </select>
                        </div>
                    )}

                    {/* Reset Filters */}
                    {(searchTerm || filterSolution || filterCategory) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterSolution('');
                                setFilterCategory('');
                            }}
                            className="px-4 py-3 bg-gray-100 text-gray-700
                                     rounded-xl hover:bg-gray-200 transition-all duration-200 
                                     flex items-center justify-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <DataTable
                        activeTab={activeTab}
                        data={getFilteredData()}
                        onEdit={handleEdit}
                        onDelete={openDeleteModal}
                        categories={categories}
                    />
                )}
            </div>

            {/* Modal Form */}
            {showModal && (
                <FormModal
                    activeTab={activeTab}
                    item={currentItem}
                    editMode={editMode}
                    categories={categories}
                    onSave={handleSave}
                    onClose={() => {
                        setShowModal(false);
                        setCurrentItem(null);
                    }}
                    onChange={(field, value) => {
                        setCurrentItem(prev => ({ ...prev, [field]: value }));
                    }}
                />
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <DeleteModal
                    item={itemToDelete}
                    activeTab={activeTab}
                    onConfirm={handleDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setItemToDelete(null);
                    }}
                />
            )}
        </div>
    );
}