import API_BASE_URL from './utils';

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Si 401, token expiré ou invalide
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      globalThis.location.href = '/login';
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    return response;
  } catch (error) {
    console.error('Erreur fetch:', error);
    throw error;
  }
};

export default API_BASE_URL;