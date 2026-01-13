import apiClient from './apiClient';

class AdminService {
  /**
   * Obtenir toutes les réservations (paginé)
   * @param {number} page 
   * @param {number} pageSize 
   */
  async getAllBookings(page = 1, pageSize = 50) {
    const response = await apiClient.get('/admin/bookings/', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  }

  /**
   * Obtenir le taux de couverture de tous les DG
   */
  async getAllCoverage() {
    const response = await apiClient.get('/admin/coverage/');
    return response.data;
  }

  /**
   * Obtenir la disponibilité des régions pour une semaine
   * @param {number} year 
   * @param {number} week 
   */
  async getRegionsAvailability(year, week) {
    const response = await apiClient.get('/admin/regions/availability/', {
      params: { year, week },
    });
    return response.data;
  }

  /**
   * Obtenir tous les utilisateurs
   */
  async getAllUsers() {
    const response = await apiClient.get('/users/');
    return response.data;
  }

  /**
   * Créer un nouvel utilisateur
   * @param {string} email 
   * @param {boolean} isAdmin 
   * @param {string} name 
   */
  async createUser(email, password, isAdmin = false) {
    const response = await apiClient.post('/users/', {
      email,
      password,
      is_admin: isAdmin,
    });
    return response.data;
  }

  /**
   * Mettre à jour un utilisateur
   * @param {number} userId 
   * @param {object} data 
   */
  async updateUser(userId, data) {
    const response = await apiClient.patch(`/users/${userId}/`, data);
    return response.data;
  }

  /**
   * Supprimer un utilisateur
   * @param {number} userId 
   */
  async deleteUser(userId) {
    const response = await apiClient.delete(`/users/${userId}/`);
    return response.data;
  }

  /**
   * Activer/Désactiver un utilisateur
   * @param {number} userId 
   * @param {boolean} isActive 
   */
  async toggleUserStatus(userId, isActive) {
    const response = await apiClient.patch(`/admin/allowed-emails/${userId}/`, {
      is_active: isActive,
    });
    return response.data;
  }
}

export default new AdminService();