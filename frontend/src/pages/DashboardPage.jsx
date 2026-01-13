import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import BookingGrid from '../components/booking/BookingGrid';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { Loading, ErrorMessage } from '../components/common/FeedbackComponents';
import { useToast } from '../context/ToastContext';
import bookingService from '../api/bookingService';
import { getCurrentYear, getWeekText } from '../utils/dateUtils';
import useAuth from '../hooks/useAuth';
import adminService from '../api/adminService';
import Footer from '../components/layout/Footer';

const DashboardPage = () => {
  const { user } = useAuth();
  const [userWeeklyBookings, setUserWeeklyBookings] = useState(new Set());
  const [regions, setRegions] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [coverage, setCoverage] = useState(null);
  const [weekAvailability, setWeekAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { success, error: showError } = useToast();

  // Modal de création
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Modal de modification - NOUVEAU
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editRegionId, setEditRegionId] = useState('');
  const [editWeek, setEditWeek] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const currentYear = getCurrentYear();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [regionsData, bookingsData, coverageData] = await Promise.all([
        bookingService.getRegions(),
        bookingService.getMyBookings(),
        bookingService.getMyCoverage(),
      ]);

      setRegions(regionsData?.results ?? regionsData ?? []);
      setMyBookings(bookingsData);
      setCoverage(coverageData);

      await loadWeekAvailability(regionsData?.results ?? regionsData ?? []);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
      showError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadWeekAvailability = async (regionsData) => {
    try {
      const availability = {};
      const userWeeks = new Set(); // NOUVEAU : Tracker les semaines réservées par l'utilisateur

      // Pour l'admin : récupérer toutes les réservations
      if (user?.is_admin) {
        const allBookings = await adminService.getAllBookings(1, 1000);
        const bookings = allBookings.results || allBookings;

        bookings.forEach(booking => {
          const key = `${booking.region}-${booking.week}`;
          availability[key] = booking.user_email;
        });
      } else {
        // Pour les directeurs : combiner mes réservations + disponibilité
        const [myBookings, ...availabilityResults] = await Promise.all([
          bookingService.getMyBookings(),
          ...regionsData.map(region =>
            bookingService.getWeeksAvailability(region.id, currentYear)
              .then(data => ({ regionId: region.id, data }))
              .catch(() => ({ regionId: region.id, data: null }))
          )
        ]);

        // NOUVEAU : Collecter toutes les semaines réservées par l'utilisateur
        myBookings.forEach(booking => {
          const key = `${booking.region}-${booking.week}`;
          availability[key] = user?.email;
          userWeeks.add(booking.week); // Ajouter la semaine au Set
        });

        // Marquer les autres comme réservées
        availabilityResults.forEach(({ regionId, data }) => {
          if (data && data.weeks) {
            data.weeks.forEach(weekInfo => {
              if (!weekInfo.is_available) {
                const key = `${regionId}-${weekInfo.week}`;
                if (!availability[key]) {
                  availability[key] = weekInfo.booked_by || 'other';
                }
              }
            });
          }
        });
      }

      setWeekAvailability(availability);
      setUserWeeklyBookings(userWeeks); // NOUVEAU : Sauvegarder les semaines de l'utilisateur
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleCellClick = (region, week) => {
    setSelectedRegion(region);
    setSelectedWeek(week);
    setShowBookingModal(true);
    setBookingError('');
  };

  const handleCreateBooking = async () => {
    if (!selectedRegion || !selectedWeek) return;

    try {
      setBookingLoading(true);
      setBookingError('');

      await bookingService.createBooking(selectedRegion.id, currentYear, selectedWeek);

      success('✅ Réservation créée avec succès !');

      await loadDashboardData();

      setShowBookingModal(false);
      setSelectedRegion(null);
      setSelectedWeek(null);
    } catch (err) {
      const errorMessage = err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.message
        || 'Erreur lors de la création de la réservation';
      setBookingError(errorMessage);
      showError(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  // Ouvrir le modal de modification - NOUVEAU
  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setEditRegionId(booking.region);
    setEditWeek(booking.week);
    setShowEditModal(true);
    setEditError('');
  };

  // Modifier une réservation - NOUVEAU
  const handleUpdateBooking = async () => {
    if (!editingBooking) return;

    try {
      setEditLoading(true);
      setEditError('');

      const updateData = {};

      // Inclure seulement les champs modifiés
      if (parseInt(editRegionId) !== editingBooking.region) {
        updateData.region = parseInt(editRegionId);
      }
      if (parseInt(editWeek) !== editingBooking.week) {
        updateData.week = parseInt(editWeek);
      }

      if (Object.keys(updateData).length === 0) {
        setEditError('Aucune modification détectée');
        return;
      }

      await bookingService.updateBooking(editingBooking.id, updateData);

      success('✅ Réservation modifiée avec succès !');

      await loadDashboardData();

      setShowEditModal(false);
      setEditingBooking(null);
    } catch (err) {
      const errorMessage = err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.message
        || err.response?.data?.detail
        || 'Erreur lors de la modification de la réservation';
      setEditError(errorMessage);
      showError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  // Supprimer une réservation - NOUVEAU
  const handleDeleteBooking = async (bookingId, regionName, week) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir annuler votre réservation ?\n\nAxe : ${regionName}\nSemaine : ${week}`
    );

    if (!confirmed) return;

    try {
      await bookingService.deleteBooking(bookingId);

      success('✅ Réservation annulée avec succès !');

      await loadDashboardData();
    } catch (err) {
      const errorMessage = err.response?.data?.message
        || err.response?.data?.detail
        || 'Erreur lors de la suppression de la réservation';
      showError(errorMessage);
      console.error(err);
    }
  };

  const handleDownloadICS = async (bookingId) => {
    try {
      await bookingService.downloadICS(bookingId);
      success('📅 Fichier ICS téléchargé avec succès !');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du téléchargement du fichier ICS';
      showError(errorMessage);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6">
          <Loading text="Chargement du dashboard..." />
        </div>
      </div>
    );
  }

  // Calcul des stats
  const percentage = coverage?.coverage_rate || 0;
  const distinctRegions = coverage?.distinct_regions_count || 0;
  const totalRegions = coverage?.total_regions || 7;

  const getCoverageColor = () => {
    if (percentage >= 80) return 'green';
    if (percentage >= 50) return 'orange';
    if (percentage >= 30) return 'yellow';
    return 'red';
  };

  const coverageColor = getCoverageColor();

  const colorClasses = {
    green: { gradient: 'from-green-500 to-green-600', bar: 'bg-green-500', text: 'text-green-600' },
    blue: { gradient: 'from-blue-500 to-blue-600', bar: 'bg-blue-500', text: 'text-blue-600' },
    yellow: { gradient: 'from-yellow-500 to-yellow-600', bar: 'bg-yellow-500', text: 'text-yellow-600' },
    red: { gradient: 'from-red-500 to-red-600', bar: 'bg-red-500', text: 'text-red-600' },
    orange: { gradient: 'from-orange-500 to-orange-600', bar: 'bg-orange-500', text: 'text-orange-600' },
  };

  const coverageColors = colorClasses[coverageColor];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {error && (
          <div className="mb-6 animate-fadeIn">
            <ErrorMessage message={error} onRetry={loadDashboardData} />
          </div>
        )}

        {/* En-tête */}
        <div className="my-6 animate-fadeIn">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Mon Dashboard</h1>
          <p className="text-gray-600">Année {currentYear}</p>
        </div>

        {/* Widgets compacts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          {/* Widget Couverture */}
          <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${coverageColors.gradient} rounded-xl flex items-center justify-center shadow-md`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Couverture</p>
                  <p className="text-xs text-gray-500">{distinctRegions}/{totalRegions} axes</p>
                </div>
              </div>
              <p className={`text-3xl font-bold ${coverageColors.text}`}>
                {percentage.toFixed(0)}%
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className={`${coverageColors.bar} h-2 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }} />
            </div>
          </div>

          {/* Widget Réservations */}
          <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Mes Réservations</p>
                  <p className="text-xs text-gray-500">Missions planifiées</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-orange-500">{myBookings.length}</p>
            </div>
          </div>

          {/* Widget Axes */}
          <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Axes</p>
                  <p className="text-xs text-gray-500">Sénégal</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">{regions.length}</p>
            </div>
          </div>
        </div>

        {/* Grille de réservation */}
        <div className="mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <BookingGrid
            regions={regions}
            year={currentYear}
            onCellClick={handleCellClick}
            weekAvailability={weekAvailability}
            currentUserEmail={user?.email}
            isAdmin={user?.is_admin}
            userWeeklyBookings={userWeeklyBookings}
          />
        </div>

        {/* Liste des réservations avec actions - AMÉLIORÉ */}
        <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h2 className="text-xl font-bold text-white">Mes Réservations</h2>
                </div>
                <span className="px-4 py-1.5 bg-white bg-opacity-20 rounded-full text-gray text-sm font-semibold">
                  {myBookings.length}
                </span>
              </div>
            </div>

            <div className="p-6">
              {myBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg mb-2">Aucune réservation</p>
                  <p className="text-gray-400 text-sm">Cliquez sur une semaine dans la grille pour réserver</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                        <th className="px-6 py-4 text-left text-sm font-semibold rounded-tl-lg">Axe</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Semaine</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Dates</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Créée le</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold rounded-tr-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myBookings.map((booking, index) => (
                        <tr
                          key={booking.id}
                          className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <span className="font-semibold text-gray-800">{booking.region_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                              S{booking.week}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700 font-medium">
                            {getWeekText(booking.year, booking.week)}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {new Date(booking.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* Bouton Télécharger ICS */}
                              <button
                                onClick={() => handleDownloadICS(booking.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                title="Télécharger ICS"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Agenda
                              </button>
                              {/* Bouton Modifier - NOUVEAU */}
                              <button
                                onClick={() => handleEditClick(booking)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier
                              </button>

                              {/* Bouton Supprimer - NOUVEAU */}
                              <button
                                onClick={() => handleDeleteBooking(booking.id, booking.region_name, booking.week)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Annuler
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Modal de création */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>Confirmer la réservation</span>
          </div>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateBooking} disabled={bookingLoading}>
              {bookingLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Réservation...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Confirmer</span>
                </div>
              )}
            </Button>
          </>
        }
      >
        {bookingError && (
          <div className="mb-4">
            <ErrorMessage message={bookingError} />
          </div>
        )}

        {selectedRegion && selectedWeek && (
          <div className="space-y-4">
            <p className="text-gray-700 text-center text-lg">
              Voulez-vous réserver cette mission ?
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700">Axe :</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{selectedRegion.name}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700">Période :</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">
                    {getWeekText(currentYear, selectedWeek)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de modification - NOUVEAU */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span>Modifier la réservation</span>
          </div>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateBooking} disabled={editLoading}>
              {editLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Modification...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Enregistrer</span>
                </div>
              )}
            </Button>
          </>
        }
      >
        {editError && (
          <div className="mb-4">
            <ErrorMessage message={editError} />
          </div>
        )}

        {editingBooking && (
          <div className="space-y-4">
            <p className="text-gray-700 text-center text-lg mb-4">
              Modifiez les détails de votre réservation
            </p>

            {/* Sélecteur d'axe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Axe
              </label>
              <select
                value={editRegionId}
                onChange={(e) => setEditRegionId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélecteur de semaine */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semaine
              </label>
              <select
                value={editWeek}
                onChange={(e) => setEditWeek(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
                  <option key={week} value={week}>
                    Semaine {week} - {getWeekText(currentYear, week)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-yellow-800">
                Si le nouveau créneau est déjà pris, la modification sera refusée.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;