import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { 
    Chart as ChartJS, 
    Title, 
    Tooltip, 
    Legend, 
    LineElement, 
    ArcElement, 
    BarElement, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    Filler 
} from "chart.js";
import { 
    FileText, 
    TrendingUp, 
    DollarSign, 
    Eye, 
    Calendar,
    RefreshCw,
    BarChart3,
    Clock,
    CheckCircle,
    XCircle,
    Shield
} from 'lucide-react';
import { fetchWithAuth } from '../../utils/fetchWithAuth';
import { useAuth } from '../../context/AuthContext';

// Enregistrer les modules de Chart.js
ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Filler
);

export default function DashboardSOC() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOffers: 0,
        totalRevenue: 0,
        averageValue: 0,
        byService: [],
        recentOffers: []
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            const response = await fetchWithAuth('soc/my_dashboard/');
            const data = await response.json();

            console.log('SOC Dashboard data:', data);

            if (data?.stats) {
                setDashboardData(data);
                processStats(data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setLoading(false);
        }
    };

    const processStats = (data) => {
        const { stats, recent_offers } = data;

        console.log('Processing stats:', stats);

        setStats({
            totalOffers: stats.total_offers || 0,
            totalRevenue: stats.total_revenue || 0,
            averageValue: stats.total_offers > 0 
                ? (stats.total_revenue / stats.total_offers) 
                : 0,
            byService: stats.by_service || [],
            recentOffers: recent_offers || []
        });
    };

    // Préparer les données pour le graphique par service (Doughnut)
    const getServiceData = () => {
        if (!stats.byService || stats.byService.length === 0) {
            return {
                labels: [],
                data: [],
                backgroundColor: []
            };
        }

        const colors = {
            'pack_essential': '#3b82f6',
            'pack_monitor': '#ef4444',
            'pack_360': '#8b5cf6',
            'scan_vulnerability': '#10b981',
            'pentest': '#f59e0b',
            'audit_security': '#ec4899',
            'formation': '#6366f1',
            'supervision_h24': '#14b8a6'
        };

        const labels = stats.byService.map(s => s.service_name || s.service);
        const data = stats.byService.map(s => s.count);
        const backgroundColor = stats.byService.map(s => 
            colors[s.service] || '#6b7280'
        );

        return { labels, data, backgroundColor };
    };

    // Nouveau graphique pour les statistiques détaillées par service
    const getServiceStatsData = () => {
        if (!stats.byService || stats.byService.length === 0) {
            return null;
        }

        const colors = {
            'pack_essential': '#3b82f6',
            'pack_monitor': '#ef4444',
            'pack_360': '#8b5cf6',
            'scan_vulnerability': '#10b981',
            'pentest': '#f59e0b',
            'audit_security': '#ec4899',
            'formation': '#6366f1',
            'supervision_h24': '#14b8a6'
        };

        const labels = stats.byService.map(s => s.service_name || s.service);
        const offersData = stats.byService.map(s => s.count);
        const revenueData = stats.byService.map(s => s.total / 1000000); // Convertir en millions
        const backgroundColors = stats.byService.map(s => 
            colors[s.service] || '#6b7280'
        );

        return {
            labels,
            datasets: [
                {
                    label: 'Nombre d\'offres',
                    data: offersData,
                    backgroundColor: backgroundColors.map(color => color + '80'),
                    borderColor: backgroundColors,
                    borderWidth: 2,
                    yAxisID: 'y',
                },
                {
                    label: 'Revenus (M FCFA)',
                    data: revenueData,
                    backgroundColor: '#DC2626',
                    borderColor: '#DC2626',
                    borderWidth: 2,
                    yAxisID: 'y1',
                    type: 'line',
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                }
            ]
        };
    };

    const serviceStatsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 15,
                    font: { size: 12, weight: 'bold' },
                    usePointStyle: true,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        
                        if (label.includes('Revenus')) {
                            return `${label}: ${value.toFixed(2)} M FCFA`;
                        }
                        return `${label}: ${value}`;
                    }
                }
            }
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                title: {
                    display: true,
                    text: 'Nombre d\'offres',
                    font: { size: 12, weight: 'bold' }
                },
                ticks: {
                    stepSize: 1
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                grid: {
                    drawOnChartArea: false,
                },
                title: {
                    display: true,
                    text: 'Revenus (M FCFA)',
                    font: { size: 12, weight: 'bold' }
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    // Préparer les données pour le graphique d'évolution (simplifié)
    const getMonthlyRevenueData = () => {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const currentMonth = new Date().getMonth();
        
        const labels = [];
        const data = [];

        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            labels.push(months[monthIndex]);
            data.push((stats.totalRevenue / 6000000).toFixed(2));
        }

        return { labels, data };
    };

    const serviceDistribution = getServiceData();
    const monthlyRevenue = getMonthlyRevenueData();
    const serviceStatsData = getServiceStatsData();

    const revenueData = {
        labels: monthlyRevenue.labels,
        datasets: [
            {
                label: "Revenus (M FCFA)",
                data: monthlyRevenue.data,
                borderColor: "#DC2626",
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "#DC2626",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const revenueOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                callbacks: {
                    label: (context) => `${context.parsed.y} M FCFA`
                }
            }
        },
        scales: {
            y: { 
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    callback: (value) => `${value}M`
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
    };

    const categoryData = {
        labels: serviceDistribution.labels,
        datasets: [
            {
                data: serviceDistribution.data,
                backgroundColor: serviceDistribution.backgroundColor,
                borderWidth: 2,
                borderColor: '#fff',
            },
        ],
    };

    const categoryOptions = {
        responsive: true,
        plugins: {
            legend: { 
                position: "right",
                labels: {
                    padding: 10,
                    font: { size: 11 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed;
                        const service = stats.byService[context.dataIndex];
                        const revenue = service ? service.total : 0;
                        return [
                            `${label}: ${value} offre${value > 1 ? 's' : ''}`,
                            `Revenu: ${new Intl.NumberFormat('fr-FR').format(revenue)} FCFA`
                        ];
                    }
                }
            }
        },
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-red-600" />
                        Tableau de bord SOC
                        {dashboardData?.user && (
                            <span className="text-red-600"> - {dashboardData.user.full_name || dashboardData.user.username}</span>
                        )}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Vue d'ensemble de vos offres cybersécurité
                    </p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="px-4 py-2 bg-white text-gray-700
                             rounded-xl border border-gray-200
                             hover:bg-gray-50 transition-all duration-200 
                             flex items-center gap-2 shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Actualiser
                </button>
            </div>

            {/* Cartes récapitulatives */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Offres créées */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100
                              hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-gray-500 text-sm font-medium mb-2">
                                Mes Offres SOC
                            </p>
                            <p className="text-3xl font-bold text-gray-800 mb-3">
                                {stats.totalOffers}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <FileText className="w-4 h-4" />
                                <span>Total créées</span>
                            </div>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl 
                                      flex items-center justify-center shadow-lg">
                            <FileText className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                {/* Revenus totaux */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100
                              hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-gray-500 text-sm font-medium mb-2">
                                Revenus totaux
                            </p>
                            <p className="text-3xl font-bold text-gray-800 mb-3">
                                {(stats.totalRevenue / 1000000).toFixed(1)}M
                            </p>
                            <div className="flex items-center gap-1 text-sm text-green-600">
                                <TrendingUp className="w-4 h-4" />
                                <span>FCFA</span>
                            </div>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl 
                                      flex items-center justify-center shadow-lg">
                            <DollarSign className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                {/* Valeur moyenne */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100
                              hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-gray-500 text-sm font-medium mb-2">
                                Valeur moyenne
                            </p>
                            <p className="text-3xl font-bold text-gray-800 mb-3">
                                {stats.averageValue > 0 
                                    ? new Intl.NumberFormat('fr-FR').format(Math.round(stats.averageValue))
                                    : '0'
                                }
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <TrendingUp className="w-4 h-4" />
                                <span>FCFA par offre</span>
                            </div>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl 
                                      flex items-center justify-center shadow-lg">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphiques */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-red-500" />
                        Évolution des revenus
                    </h3>
                    <div className="h-64">
                        <Line data={revenueData} options={revenueOptions} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        Répartition par service
                    </h3>
                    {stats.byService.length > 0 ? (
                        <div className="h-64 w-full flex items-center justify-center">
                            <Doughnut data={categoryData} options={categoryOptions} />
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            <p>Aucune donnée disponible</p>
                        </div>
                    )}
                </div>
            </div>

            {/* NOUVEAU: Graphique détaillé par service */}
            {serviceStatsData && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-red-500" />
                            Statistiques détaillées par service
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Comparaison du nombre d'offres et des revenus par service
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="h-80">
                            <Bar data={serviceStatsData} options={serviceStatsOptions} />
                        </div>
                    </div>
                </div>
            )}

            {/* Tableau des dernières offres */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-red-500" />
                        {user.is_admin === true ? 'Dernières offres créées par tous les utilisateurs' : 'Mes dernières offres'}
                    </h3>
                    <button 
                        onClick={() => navigate('/soc/offers')}
                        className="text-red-600 hover:text-red-700
                                 font-semibold text-sm transition-colors duration-200"
                    >
                        Voir tout →
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    ID
                                </th>
                                {user.is_admin === true && (
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Créé par
                                </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Objet
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Total TTC
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {stats.recentOffers.length === 0 ? (
                                <tr>
                                    <td colSpan={user.is_admin ? "8" : "7"} className="px-6 py-12 text-center">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">Aucune offre disponible</p>
                                    </td>
                                </tr>
                            ) : (
                                stats.recentOffers.map((offer) => {
                                    const statusConfig = getStatusConfig(offer.status);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <tr 
                                            key={offer.id} 
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-mono font-medium text-gray-900">
                                                    #{offer.id}
                                                </span>
                                            </td>
                                            {user.is_admin === true && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {offer.business_developer?.full_name || 'N/A'}
                                                </div>
                                            </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {offer.subject || 'Sans titre'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {offer.client?.company || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {offer.total_ttc
                                                        ? new Intl.NumberFormat('fr-FR').format(offer.total_ttc) + ' FCFA'
                                                        : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {offer.created_at 
                                                        ? new Date(offer.created_at).toLocaleDateString('fr-FR')
                                                        : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => navigate(`/soc/offer/${offer.id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 
                                                             rounded-lg transition-colors duration-200 inline-flex items-center gap-1"
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span className="text-sm">Voir</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}