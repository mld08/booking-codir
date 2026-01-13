import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut } from "react-chartjs-2";
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
    Users,
    FileText,
    TrendingUp,
    DollarSign,
    Eye,
    Calendar,
    ArrowUp,
    ArrowDown,
    Minus,
    RefreshCw
} from 'lucide-react';
import API_BASE_URL from '../../utils/utils';
import Aside from "../../components/Aside";
import Header from "../../components/Header";
import { fetchWithAuth } from '../../utils/fetchWithAuth';

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

export default function Dashboard() {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    //const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalClients: 0,
        totalOffers: 0,
        totalRevenue: 0,
        monthlyGrowth: 0,
        offersGrowth: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Récupérer les offres et clients en parallèle
            const [offersResponse, clientsResponse] = await Promise.all([
                fetchWithAuth('offers/'),
                fetchWithAuth('clients/')
                //fetch(`${API_BASE_URL}offers`),
                //fetch(`${API_BASE_URL}clients`)
            ]);

            const offersData = await offersResponse.json();
            const clientsData = await clientsResponse.json();

            if (!Array.isArray(offersData)) {
                console.error('offersData n\'est pas un tableau:', offersData);
                setOffers([]);
                return;
            }

            setOffers(offersData);
            //setClients(clientsData);

            // Calculer les statistiques
            calculateStats(offersData, clientsData);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (offersData, clientsData) => {
        // Total des clients
        const totalClients = clientsData.length;

        // Total des offres
        const totalOffers = offersData.length;

        // Revenu total (somme des prix TTC)
        const totalRevenue = offersData.reduce((sum, offer) => {
            return sum + (Number(offer.total_price_with_vat) || 0);
        }, 0);

        // Calculer la croissance mensuelle (comparer le mois actuel au précédent)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthOffers = offersData.filter(offer => {
            const offerDate = new Date(offer.created_at);
            return offerDate.getMonth() === currentMonth && offerDate.getFullYear() === currentYear;
        });

        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const lastMonthOffers = offersData.filter(offer => {
            const offerDate = new Date(offer.created_at);
            return offerDate.getMonth() === lastMonth && offerDate.getFullYear() === lastMonthYear;
        });

        const offersGrowth = lastMonthOffers.length > 0
            ? (((currentMonthOffers.length - lastMonthOffers.length) / lastMonthOffers.length) * 100).toFixed(1)
            : 0;

        const currentMonthRevenue = currentMonthOffers.reduce((sum, o) => sum + (Number(o.total_price_with_vat) || 0), 0);
        const lastMonthRevenue = lastMonthOffers.reduce((sum, o) => sum + (Number(o.total_price_with_vat) || 0), 0);

        const monthlyGrowth = lastMonthRevenue > 0
            ? (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
            : 0;

        setStats({
            totalClients,
            totalOffers,
            totalRevenue,
            monthlyGrowth: parseFloat(monthlyGrowth),
            offersGrowth: parseFloat(offersGrowth)
        });
        console.log('Stats calculées:', stats);
    };

    // Préparer les données pour le graphique d'évolution mensuelle
    const getMonthlyRevenueData = () => {
        const monthlyData = {};
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        // Initialiser les 12 derniers mois
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            monthlyData[key] = { revenue: 0, count: 0 };
        }

        // Calculer les revenus par mois
        offers.forEach(offer => {
            const date = new Date(offer.created_at);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            if (monthlyData[key]) {
                monthlyData[key].revenue += Number(offer.total_price_with_vat) || 0;
                monthlyData[key].count += 1;
            }
        });

        const labels = [];
        const data = [];

        Object.keys(monthlyData).forEach(key => {
            const [year, month] = key.split('-');
            labels.push(months[parseInt(month)]);
            data.push(monthlyData[key].revenue / 1000000); // Convertir en millions
        });

        return { labels, data };
    };

    // Préparer les données pour le graphique par solution
    const getSolutionData = () => {
        const solutionCount = {};

        offers.forEach(offer => {
            const solution = offer.solution || 'Autre';
            solutionCount[solution] = (solutionCount[solution] || 0) + 1;
        });

        const labels = Object.keys(solutionCount).map(s => s.toUpperCase());
        const data = Object.values(solutionCount);

        const colors = {
            'vmware': '#3b82f6',
            'huawei': '#ef4444',
            'colocation': '#10b981',
            'draas': '#f59e0b',
            'baas': '#8b5cf6',
            'staas': '#ec4899',
            'office365': '#6366f1'
        };

        const backgroundColor = labels.map(label =>
            colors[label.toLowerCase()] || '#6b7280'
        );

        return { labels, data, backgroundColor };
    };

    const monthlyRevenue = getMonthlyRevenueData();
    const solutionDistribution = getSolutionData();

    const revenueData = {
        labels: monthlyRevenue.labels,
        datasets: [
            {
                label: "Revenus (M FCFA)",
                data: monthlyRevenue.data,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--brand-orange').trim() || "#FF7900",
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--brand-orange-alpha-10').trim() || "rgba(255, 121, 0, 0.1)",
                tension: 0.4,
                fill: true,
                pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--brand-orange').trim() || "#FF7900",
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
                    label: (context) => `${context.parsed.y.toFixed(2)} M FCFA`
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
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
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
            baas: 'bg-green-100 text-green-800',
            draas: 'bg-yellow-100 text-yellow-800',
            office365: 'bg-indigo-100 text-indigo-800',
            colocation: 'bg-gray-100 text-gray-800'
        };
        return colors[solution] || 'bg-gray-100 text-gray-800';
    };

    const getGrowthIcon = (value) => {
        if (value > 0) return <ArrowUp className="w-4 h-4" />;
        if (value < 0) return <ArrowDown className="w-4 h-4" />;
        return <Minus className="w-4 h-4" />;
    };

    const getGrowthColor = (value) => {
        if (value > 0) return 'text-green-500';
        if (value < 0) return 'text-red-500';
        return 'text-gray-500';
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
                    <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Clients actifs */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 
                              hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-gray-500 text-sm font-medium mb-2">
                                Clients actifs
                            </p>
                            <p className="text-3xl font-bold text-gray-800 mb-3">
                                {stats.totalClients}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Users className="w-4 h-4" />
                                <span>Total enregistrés</span>
                            </div>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl 
                                      flex items-center justify-center shadow-lg">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                {/* Offres créées */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100  
                              hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-gray-500 text-sm font-medium mb-2">
                                Offres créées
                            </p>
                            <p className="text-3xl font-bold text-gray-800 mb-3">
                                {stats.totalOffers}
                            </p>
                            <div className={`flex items-center gap-1 text-sm ${getGrowthColor(stats.offersGrowth)}`}>
                                {getGrowthIcon(stats.offersGrowth)}
                                <span>{Math.abs(stats.offersGrowth)}% vs mois dernier</span>
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
                            <p className="text-gray-500 text-sm font-medium mb-2">
                                Revenus totaux
                            </p>
                            <p className="text-3xl font-bold text-gray-800 mb-3">
                                {(stats.totalRevenue / 1000000).toFixed(1)}M
                            </p>
                            <div className={`flex items-center gap-1 text-sm ${getGrowthColor(stats.monthlyGrowth)}`}>
                                {getGrowthIcon(stats.monthlyGrowth)}
                                <span>{Math.abs(stats.monthlyGrowth)}% vs mois dernier</span>
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
                                {stats.totalOffers > 0
                                    ? new Intl.NumberFormat('fr-FR').format(Math.round(stats.totalRevenue / stats.totalOffers))
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
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 ">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        Évolution des revenus (12 derniers mois)
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
                    <div className="h-64 w-ful flex items-center justify-center">
                        <Doughnut data={categoryData} options={categoryOptions} />
                    </div>
                </div>
            </div>

            {/* Tableau des dernières offres */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        Dernières offres créées
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
                                    Objet
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Solution
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
                            {offers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">Aucune offre disponible</p>
                                    </td>
                                </tr>
                            ) : (
                                offers
                                    .slice()
                                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                    .slice(0, 5)
                                    .map((offer) => (
                                        <tr
                                            key={offer.id}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
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
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSolutionBadge(offer.solution)}`}>
                                                    {offer.solution?.toUpperCase() || 'N/A'}
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
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}