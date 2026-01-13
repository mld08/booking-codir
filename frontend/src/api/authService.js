import apiClient from './apiClient';

class AuthService {
  /**
   * Connexion par email + mot de passe
   * @param {string} email 
   * @param {string} password
   */
  async login(email, password) {
    const response = await apiClient.post('/auth/login/', {
      email,
      password,
    });

    const {
      access,
      refresh,
      user,
      user_type,
      redirect_to,
      message,
    } = response.data;

    // Stockage des données d'authentification
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('user_type', user_type);
    localStorage.setItem('redirect_to', redirect_to);

    return {
      access,
      refresh,
      user,
      user_type,
      redirect_to,
      message,
    };
  }

  /**
   * Déconnexion
   */
  // async logout() {
  //   const refreshToken = localStorage.getItem('refresh_token');

  //   if (refreshToken) {
  //     try {
  //       await apiClient.post('/auth/logout/', {
  //         refresh: refreshToken,
  //       });
  //     } catch (error) {
  //       console.error('Erreur lors de la déconnexion:', error);
  //     }
  //   }

  //   // Nettoyage du localStorage
  //   localStorage.removeItem('access_token');
  //   localStorage.removeItem('refresh_token');
  //   localStorage.removeItem('user');
  //   localStorage.removeItem('user_type');
  //   localStorage.removeItem('redirect_to');
  // }
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_type');
    localStorage.removeItem('redirect_to');
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Récupérer l'utilisateur courant
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Type d'utilisateur (admin | dg)
   */
  getUserType() {
    return localStorage.getItem('user_type');
  }

  /**
   * Vérifier si l'utilisateur est administrateur
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.is_admin === true;
  }

  /**
   * Récupérer la route de redirection après login
   */
  getRedirectPath() {
    return localStorage.getItem('redirect_to') || '/';
  }
}

export default new AuthService();
