import apiClient from './apiClient';

class BookingService {
  /**
   * Obtenir toutes les régions
   */
  async getRegions() {
    const response = await apiClient.get('/regions/');
    return response.data;
  }

  /**
   * Créer une réservation
   * @param {number} regionId 
   * @param {number} year 
   * @param {number} week 
   */
  async createBooking(regionId, year, week) {
    const response = await apiClient.post('/bookings/', {
      region: regionId,
      year,
      week,
    });
    return response.data;
  }

  // Modifier une réservation (NOUVEAU)
  async updateBooking(bookingId, data) {
    const response = await apiClient.patch(`/bookings/${bookingId}/`, data);
    return response.data;
  }

  // Supprimer une réservation (NOUVEAU)
  async deleteBooking(bookingId) {
    const response = await apiClient.delete(`/bookings/${bookingId}/`);
    return response.data;
  }

  /**
   * Télécharger le fichier ICS d'une réservation
   * @param {number} bookingId 
   */
  async downloadICS(bookingId) {
    const response = await apiClient.get(`/bookings/${bookingId}/download-ics/`, {
      responseType: 'blob'
    });

    // Créer un lien de téléchargement
    const url = globalThis.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reservation-${bookingId}.ics`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    globalThis.URL.revokeObjectURL(url);
  }

  /**
   * Obtenir mes réservations
   */
  async getMyBookings() {
    const response = await apiClient.get('/bookings/my/');
    return response.data;
  }

  /**
   * Obtenir toutes les réservations (selon le rôle)
   */
  async getAllBookings() {
    const response = await apiClient.get('/bookings/');
    return response.data;
  }

  /**
   * Obtenir mon taux de couverture
   */
  async getMyCoverage() {
    const response = await apiClient.get('/coverage/my/');
    return response.data;
  }

  /**
   * Obtenir les semaines disponibles pour une région
   * @param {number} regionId 
   * @param {number} year 
   */
  async getWeeksAvailability(regionId, year) {
    const response = await apiClient.get('/weeks/availability/', {
      params: { region_id: regionId, year },
    });
    return response.data;
  }
}

export default new BookingService();