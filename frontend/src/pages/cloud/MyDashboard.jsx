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
    XCircle
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

export default function MyDashboard() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOffers: 0,
        totalRevenue: 0,
        averageValue: 0,
        bySolution: [],
        recentOffers: []
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            const response = await fetchWithAuth('offers/my_dashboard/');
            const data = await response.json();

            console.log('Dashboard data:', data);

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
            bySolution: stats.by_solution || [],
            recentOffers: recent_offers || []
        });
    };

    // Préparer les données pour le graphique par solution (Doughnut)
    const getSolutionData = () => {
        if (!stats.bySolution || stats.bySolution.length === 0) {
            return {
                labels: [],
                data: [],
                backgroundColor: []
            };
        }

        const colors = {
            'vmware': '#3b82f6',
            'huawei': '#ef4444',
            'colocation': '#10b981',
            'draas': '#f59e0b',
            'baas': '#8b5cf6',
            'staas': '#ec4899',
            'office365': '#6366f1'
        };

        const labels = stats.bySolution.map(s => s.solution.toUpperCase());
        const data = stats.bySolution.map(s => s.count);
        const backgroundColor = stats.bySolution.map(s => 
            colors[s.solution.toLowerCase()] || '#6b7280'
        );

        return { labels, data, backgroundColor };
    };

    // Nouveau graphique pour les statistiques détaillées par solution
    const getSolutionStatsData = () => {
        if (!stats.bySolution || stats.bySolution.length === 0) {
            return null;
        }

        const colors = {
            'vmware': '#3b82f6',
            'huawei': '#ef4444',
            'colocation': '#10b981',
            'draas': '#f59e0b',
            'baas': '#8b5cf6',
            'staas': '#ec4899',
            'office365': '#6366f1'
        };

        const labels = stats.bySolution.map(s => s.solution.toUpperCase());
        const offersData = stats.bySolution.map(s => s.count);
        const revenueData = stats.bySolution.map(s => s.total / 1000000); // Convertir en millions
        const backgroundColors = stats.bySolution.map(s => 
            colors[s.solution.toLowerCase()] || '#6b7280'
        );

        return {
            labels,
            datasets: [
                {
                    label: 'Nombre d\'offres',
                    data: offersData,
                    backgroundColor: backgroundColors.map(color => color + '80'), // Transparence 50%
                    borderColor: backgroundColors,
                    borderWidth: 2,
                    yAxisID: 'y',
                },
                {
                    label: 'Revenus (M FCFA)',
                    data: revenueData,
                    backgroundColor: '#FF7900',
                    borderColor: '#FF7900',
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

    const solutionStatsOptions = {
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

    const solutionDistribution = getSolutionData();
    const monthlyRevenue = getMonthlyRevenueData();
    const solutionStatsData = getSolutionStatsData();

    const revenueData = {
        labels: monthlyRevenue.labels,
        datasets: [
            {
                label: "Revenus (M FCFA)",
                data: monthlyRevenue.data,
                borderColor: "#FF7900",
                backgroundColor: "rgba(255, 121, 0, 0.1)",
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "#FF7900",
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
        labels: solutionDistribution.labels,
        datasets: [
            {
                data: solutionDistribution.data,
                backgroundColor: solutionDistribution.backgroundColor,
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
                        const solution = stats.bySolution[context.dataIndex];
                        const revenue = solution ? solution.total : 0;
                        return [
                            `${label}: ${value} offre${value > 1 ? 's' : ''}`,
                            `Revenu: ${new Intl.NumberFormat('fr-FR').format(revenue)} FCFA`
                        ];
                    }
                }
            }
        },
    };

    const getSolutionBadge = (solution) => {
        const colors = {
            vmware: 'bg-blue-100 text-blue-800',
            huawei: 'bg-red-100 text-red-800',
            staas: 'bg-purple-100 text-purple-800',
            baas: 'bg-green-100 text-green-800 ',
            draas: 'bg-yellow-100 text-yellow-800',
            office365: 'bg-indigo-100 text-indigo-800',
            colocation: 'bg-gray-100 text-gray-800'
        };
        return colors[solution.toLowerCase()] || 'bg-gray-100 text-gray-800 ';
    };

    // NOUVEAU : Badge et configuration pour le statut
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
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                    <h1 className="text-3xl font-bold text-gray-800">
                        Tableau de bord -
                        {dashboardData?.user && (
                            <span className="text-orange-500"> {dashboardData.user.full_name || dashboardData.user.username}</span>
                        )}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Vue d'ensemble de votre activité
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
                                Mes Offres
                            </p>
                            <p className="text-3xl font-bold text-gray-800 mb-3">
                                {stats.totalOffers}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <FileText className="w-4 h-4" />
                                <span>Total créées</span>
                            </div>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl 
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
                            <p className="text-gray-500  text-sm font-medium mb-2">
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
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        Évolution des revenus
                    </h3>
                    <div className="h-64">
                        <Line data={revenueData} options={revenueOptions} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-500" />
                        Répartition par solution
                    </h3>
                    {stats.bySolution.length > 0 ? (
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

            {/* NOUVEAU: Graphique détaillé par solution */}
            {solutionStatsData && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-orange-500" />
                            Statistiques détaillées par solution
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Comparaison du nombre d'offres et des revenus par solution
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="h-80">
                            <Bar data={solutionStatsData} options={solutionStatsOptions} />
                        </div>
                    </div>
                </div>
            )}

            {/* Tableau des dernières offres */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        {user.is_admin === true ? 'Dernières offres créées par tous les utilisateurs' : 'Mes dernières offres'}
                        
                    </h3>
                    <button 
                        onClick={() => navigate('/cloud/offer')}
                        className="text-orange-600 hover:text-orange-700
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
                                    Solution
                                </th>
                                {/* NOUVEAU : Colonne Statut */}
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Montant
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
                                    <td colSpan={user.is_admin ? "9" : "8"} className="px-6 py-12 text-center">
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
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSolutionBadge(offer.solution || '')}`}>
                                                    {offer.solution?.toUpperCase() || 'N/A'}
                                                </span>
                                            </td>
                                            {/* NOUVEAU : Affichage du statut */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {offer.total_price_with_vat
                                                        ? new Intl.NumberFormat('fr-FR').format(offer.total_price_with_vat) + ' FCFA'
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
                                                    onClick={() => navigate(`/cloud/offer/${offer.id}`)}
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