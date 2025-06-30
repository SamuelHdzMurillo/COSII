import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Si el error es 401 (Unauthorized) y no es un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Aquí podrías implementar lógica para refrescar el token si tu API lo soporta
      
      // Si no hay refresh token o falla la renovación, cerrar sesión
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default api;