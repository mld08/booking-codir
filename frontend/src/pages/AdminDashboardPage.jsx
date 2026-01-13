import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import { Loading, ErrorMessage } from '../components/common/FeedbackComponents';
import UserManagement from '../components/admin/UserManagement';
import BookingGrid from '../components/booking/BookingGrid';
import adminService from '../api/adminService';
import bookingService from '../api/bookingService';
import { getCurrentYear } from '../utils/dateUtils';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Données
  const [allBookings, setAllBookings] = useState([]);
  const [allCoverage, setAllCoverage] = useState([]);
  const [regions, setRegions] = useState([]);
  const [users, setUsers] = useState([]);
  const [weekAvailability, setWeekAvailability] = useState({});
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });

  const currentYear = getCurrentYear();

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      const [bookingsData, coverageData, regionsData, usersData] = await Promise.all([
        adminService.getAllBookings(1, 100),
        adminService.getAllCoverage(),
        bookingService.getRegions(),
        adminService.getAllUsers().catch(() => []),
      ]);

      const regionsList = regionsData?.results ?? regionsData ?? [];
      
      setAllBookings(bookingsData.results || bookingsData);
      setPagination({
        count: bookingsData.count,
        next: bookingsData.next,
        previous: bookingsData.previous,
      });
      setAllCoverage(coverageData);
      setRegions(regionsList);
      setUsers(usersData?.results ?? usersData ?? []);

      // Charger disponibilités
      await loadWeekAvailability(regionsList);
    } catch (err) {
      setError('Erreur lors du chargement des données administrateur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeekAvailability = async (regionsData) => {
    try {
      const availability = {};
      
      const promises = regionsData.map(region => 
        bookingService.getWeeksAvailability(region.id, currentYear)
          .then(data => ({ regionId: region.id, data }))
          .catch(() => ({ regionId: region.id, data: null }))
      );

      const results = await Promise.all(promises);

      results.forEach(({ regionId, data }) => {
        if (data && data.weeks) {
          data.weeks.forEach(weekInfo => {
            if (!weekInfo.is_available) {
              const key = `${regionId}-${weekInfo.week}`;
              availability[key] = weekInfo.booked_by || true;
            }
          });
        }
      });

      setWeekAvailability(availability);
    } catch (err) {
      console.error('Erreur lors du chargement de la disponibilité:', err);
    }
  };

  const handleUserCreated = async (user) => {
    setUsers([...users, user]);
    await loadAdminData();
  };

  const handleUserUpdated = async (updatedUser) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    await loadAdminData();
  };

  const handleUserDeleted = async (userId) => {
    setUsers(users.filter((u) => u.id !== userId));
    await loadAdminData();
  };

  const renderOverviewTab = () => {
    const totalBookings = allBookings.length;
    const totalUsers = allCoverage.length;
    const avgCoverage = totalUsers > 0
      ? (allCoverage.reduce((sum, c) => sum + c.coverage_rate, 0) / totalUsers).toFixed(1)
      : 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            title="Total Directeurs"
            value={totalUsers}
            color="blue"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            title="Missions Totales"
            value={totalBookings}
            color="green"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            title="Couverture Moyenne"
            value={`${avgCoverage}%`}
            color="yellow"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            title="Axes"
            value={regions.length}
            color="purple"
          />
        </div>

        <Card title="Actions Rapides">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionButton
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              label="Voir le Planning"
              onClick={() => setActiveTab('planning')}
              variant="blue"
            />
            <ActionButton
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              label="Gérer les utilisateurs"
              onClick={() => setActiveTab('users')}
              variant="purple"
            />
            <ActionButton
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
              label="Voir Statistiques"
              onClick={() => setActiveTab('coverage')}
              variant="yellow"
            />
          </div>
        </Card>
      </div>
    );
  };

  const renderPlanningTab = () => {
    return (
      <BookingGrid
        regions={regions}
        year={currentYear}
        onCellClick={() => {}}
        weekAvailability={weekAvailability}
        isAdmin={true}
      />
    );
  };

  const renderCoverageTab = () => {
    const sortedCoverage = [...allCoverage].sort((a, b) => b.coverage_rate - a.coverage_rate);

    return (
      <Card title="📈 Taux de Couverture par Directeur">
        <div className="space-y-4">
          {sortedCoverage.map((coverage, index) => (
            <div key={coverage.user_email} className="group hover:shadow-md transition-all duration-200 border-2 border-gray-100 hover:border-blue-200 rounded-lg p-4 bg-gradient-to-r from-white to-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className="text-3xl font-bold text-gray-300 group-hover:text-blue-400 transition">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{coverage.user_email}</p>
                    <p className="text-sm text-gray-600">{coverage.distinct_regions_count}/{coverage.total_regions} axes couvertes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{coverage.coverage_rate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">Taux de couverture</p>
                </div>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${coverage.coverage_rate}%` }}>
                  <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderBookingsTab = () => {
    return (
      <Card title="📋 Toutes les Réservations">
        {allBookings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-gray-500">Aucune réservation pour le moment.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm text-blue-800 font-medium">Total : <span className="font-bold">{pagination.count || allBookings.length}</span> réservations</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Directeur</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Axes</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Année</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Semaine</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Créée le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4 text-gray-800">{booking.user_email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 font-medium text-gray-800">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {booking.region_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">{booking.year}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Semaine {booking.week}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{new Date(booking.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6">
          <Loading text="Chargement du dashboard admin..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={loadAdminData} />
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard Administrateur</h1>
              <p className="text-gray-600">Gestion globale des missions pour l'année {currentYear}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-2 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} label="Vue d'ensemble" />
            <TabButton active={activeTab === 'planning'} onClick={() => setActiveTab('planning')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label="Planning" />
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} label="Utilisateurs" badge={users.length} />
            <TabButton active={activeTab === 'coverage'} onClick={() => setActiveTab('coverage')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} label="Couverture" />
            <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} label="Réservations" badge={allBookings.length} />
          </div>
        </div>

        <div className="animate-fadeIn">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'planning' && renderPlanningTab()}
          {activeTab === 'users' && <UserManagement users={users} onUserCreated={handleUserCreated} onUserUpdated={handleUserUpdated} onUserDeleted={handleUserDeleted} />}
          {activeTab === 'coverage' && renderCoverageTab()}
          {activeTab === 'bookings' && renderBookingsTab()}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center text-white shadow-lg`}>{icon}</div>
      </div>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, variant }) => {
  const variants = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
  };

  return (
    <button onClick={onClick} className={`flex items-center gap-3 p-4 bg-gradient-to-br ${variants[variant]} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      {icon}
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
};

const TabButton = ({ active, onClick, icon, label, badge }) => {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${active ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}>
      {icon}
      <span>{label}</span>
      {badge !== undefined && <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white text-purple-600' : 'bg-gray-200 text-gray-700'}`}>{badge}</span>}
    </button>
  );
};

export default AdminDashboardPage;