import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  Users, Package, TrendingUp, DollarSign, BarChart3, RefreshCw,
  Award, Crown, Medal, Eye, ArrowUpRight, ArrowDownRight,
  Sparkles, Target, ChevronRight, Filter, Search
} from 'lucide-react';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('revenue'); // 'revenue' ou 'offers'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('auth/admin/dashboard/');
      const data = await response.json();
      console.log('Admin Dashboard data:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erreur lors du chargement des données</p>
        </div>
      </div>
    );
  }

  const { global_stats, business_developers } = dashboardData;

  // Calculs
  const averageOffersPerBD = global_stats.total_bds > 0 
    ? (global_stats.total_offers / global_stats.total_bds).toFixed(1)
    : 0;

  const averageRevenuePerBD = global_stats.total_bds > 0
    ? (global_stats.total_revenue / global_stats.total_bds)
    : 0;

  // Trier les BDs
  const sortedBDs = [...(business_developers || [])].sort((a, b) => {
    if (sortBy === 'revenue') return b.total_revenue - a.total_revenue;
    return b.total_offers - a.total_offers;
  });

  // Filtrer par recherche
  const filteredBDs = sortedBDs.filter(bd => 
    bd.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bd.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topPerformers = sortedBDs.slice(0, 3);

  // Données pour le graphique de comparaison des BDs (Top 10)
  const top10BDs = sortedBDs.slice(0, 10);
  const bdComparisonData = {
    labels: top10BDs.map(bd => bd.full_name || bd.username),
    datasets: [
      {
        label: 'Nombre d\'offres',
        data: top10BDs.map(bd => bd.total_offers),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Revenus (M FCFA)',
        data: top10BDs.map(bd => bd.total_revenue / 1000000),
        backgroundColor: 'rgba(255, 121, 0, 0.8)',
        borderColor: 'rgba(255, 121, 0, 1)',
        borderWidth: 2,
        type: 'line',
        yAxisID: 'y1',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const bdComparisonOptions = {
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
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre d\'offres',
          font: { size: 12, weight: 'bold' }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenus (M FCFA)',
          font: { size: 12, weight: 'bold' }
        },
        grid: {
          drawOnChartArea: false,
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  // Données pour le graphique de répartition des revenus
  const revenueDistributionData = {
    labels: top10BDs.map(bd => bd.full_name || bd.username),
    datasets: [{
      data: top10BDs.map(bd => bd.total_revenue),
      backgroundColor: [
        '#FF7900', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'
      ],
      borderWidth: 2,
      borderColor: '#fff',
    }]
  };

  const revenueDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
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
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return [
              `${context.label}`,
              `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`,
              `${percentage}% du total`
            ];
          }
        }
      }
    }
  };

  // Composant carte de statistique avec mini graphique
  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle, mini }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            trend > 0 ? 'bg-green-100 text-green-700' : 
            'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="text-sm font-bold">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );

  // Composant podium pour top 3
  const PodiumCard = ({ bd, rank }) => {
    const colors = {
      1: { bg: 'from-yellow-400 to-yellow-500', icon: Crown, border: 'border-yellow-400' },
      2: { bg: 'from-gray-400 to-gray-500', icon: Award, border: 'border-gray-400' },
      3: { bg: 'from-orange-400 to-orange-500', icon: Medal, border: 'border-orange-400' }
    };
    const config = colors[rank];
    const Icon = config.icon;

    return (
      <div className={`bg-white rounded-2xl shadow-xl border-2 ${config.border} p-6 
                     hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1`}>
        {/* Badge de rang */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${config.bg} rounded-full flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <span className="text-4xl font-bold text-gray-200">#{rank}</span>
        </div>

        {/* Avatar et nom */}
        <div className="text-center mb-4">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">
              {bd.full_name?.charAt(0).toUpperCase() || bd.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {bd.full_name || bd.username}
          </h3>
          <p className="text-sm text-gray-600">@{bd.username}</p>
        </div>

        {/* Statistiques */}
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Offres</span>
              <span className="text-2xl font-bold text-blue-700">{bd.total_offers}</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Revenus</span>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-700">
                  {(bd.total_revenue / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-600">FCFA</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Moy/offre</span>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-700">
                  {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(bd.total_revenue / bd.total_offers)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Dashboard Administrateur
              </h1>
              <p className="text-gray-600 mt-1">
                Vue d'ensemble des performances commerciales
              </p>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-white text-gray-700  
                     rounded-xl border border-gray-200  
                     hover:bg-gray-50 transition-all duration-200 
                     flex items-center gap-2 shadow-lg hover:shadow-xl font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Actualiser
          </button>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Offres"
            value={global_stats.total_offers}
            icon={Package}
            color="blue"
            subtitle={`${averageOffersPerBD} par BD en moyenne`}
          />
          <StatCard
            title="Revenus Totaux"
            value={`${(global_stats.total_revenue / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            color="green"
            subtitle="FCFA générés"
          />
          <StatCard
            title="Business Developers"
            value={global_stats.total_bds}
            icon={Users}
            color="purple"
            subtitle="Actifs sur la plateforme"
          />
          <StatCard
            title="Revenu Moyen/BD"
            value={`${(averageRevenuePerBD / 1000000).toFixed(1)}M`}
            icon={TrendingUp}
            color="orange"
            subtitle="FCFA par BD"
          />
        </div>

        {/* Podium Top 3 */}
        {topPerformers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-7 h-7 text-orange-500" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                🏆 Top 3 Performers
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topPerformers.map((bd, index) => (
                <PodiumCard key={bd.id} bd={bd} rank={index + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique de comparaison */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-orange-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Comparaison Top 10 BDs
                </h3>
                <p className="text-sm text-gray-600">
                  Offres vs Revenus
                </p>
              </div>
            </div>
            <div className="h-80">
              <Bar data={bdComparisonData} options={bdComparisonOptions} />
            </div>
          </div>

          {/* Graphique de répartition */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-orange-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Répartition des Revenus
                </h3>
                <p className="text-sm text-gray-600">
                  Top 10 Business Developers
                </p>
              </div>
            </div>
            <div className="h-80 flex items-center justify-center">
              <Doughnut data={revenueDistributionData} options={revenueDistributionOptions} />
            </div>
          </div>
        </div>

        {/* Tableau complet des BDs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Tous les Business Developers
                </h2>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 datext-sm font-bold rounded-full">
                  {filteredBDs.length}
                </span>
              </div>

              {/* Filtres et recherche */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl
                             bg-white text-gray-900 
                             focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20
                             transition-all duration-200 outline-none"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto pl-10 pr-10 py-2 border-2 border-gray-200 rounded-xl
                             bg-white text-gray-900 
                             focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20
                             transition-all duration-200 outline-none appearance-none cursor-pointer"
                  >
                    <option value="revenue">Trier par revenus</option>
                    <option value="offers">Trier par offres</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table responsive */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Rang
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Business Developer
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Offres
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Revenus
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Moy/Offre
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBDs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Aucun Business Developer trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredBDs.map((bd, index) => {
                    const isTopThree = index < 3;
                    const rankColor = index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : index === 2 ? 'text-orange-600' : 'text-gray-400';
                    
                    return (
                      <tr 
                        key={bd.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${rankColor}`}>
                              #{index + 1}
                            </span>
                            {isTopThree && (
                              index === 0 ? <Crown className="w-5 h-5 text-yellow-500" /> :
                              index === 1 ? <Award className="w-5 h-5 text-gray-500" /> :
                              <Medal className="w-5 h-5 text-orange-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow">
                              <span className="text-white text-sm font-bold">
                                {bd.full_name?.charAt(0).toUpperCase() || bd.username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {bd.full_name || bd.username}
                              </p>
                              <p className="text-xs text-gray-600">
                                @{bd.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold
                                       bg-blue-100 text-blue-800">
                            {bd.total_offers}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {(bd.total_revenue / 1000000).toFixed(2)}M
                            </p>
                            <p className="text-xs text-gray-500">FCFA</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(bd.total_revenue / bd.total_offers)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => navigate(`/admin/bd/${bd.id}`)}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-orange-100  
                                     text-orange-700  rounded-lg
                                     hover:bg-orange-200 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Voir
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

        {/* Actions rapides */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/cloud/offer')}
            className="p-6 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300
                     hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
          >
            <Package className="w-10 h-10 text-gray-400 group-hover:text-blue-500 mx-auto mb-3 transition-colors" />
            <p className="text-sm font-bold text-gray-700 group-hover:text-blue-600 text-center">
              Toutes les offres
            </p>
          </button>

          <button
            onClick={() => navigate('/clients')}
            className="p-6 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300 
                     hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
          >
            <Users className="w-10 h-10 text-gray-400 group-hover:text-green-500 mx-auto mb-3 transition-colors" />
            <p className="text-sm font-bold text-gray-700 group-hover:text-green-600 text-center">
              Gérer les clients
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/managers')}
            className="p-6 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300
                     hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
          >
            <Users className="w-10 h-10 text-gray-400 group-hover:text-purple-500 mx-auto mb-3 transition-colors" />
            <p className="text-sm font-bold text-gray-700 group-hover:text-purple-600 text-center">
              Gérer les managers
            </p>
          </button>

          <button
            onClick={() => navigate('/cloud/gestion-prix')}
            className="p-6 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300 
                     hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group"
          >
            <DollarSign className="w-10 h-10 text-gray-400 group-hover:text-orange-500 mx-auto mb-3 transition-colors" />
            <p className="text-sm font-bold text-gray-700 group-hover:text-orange-600 text-center">
              Gérer les prix
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}