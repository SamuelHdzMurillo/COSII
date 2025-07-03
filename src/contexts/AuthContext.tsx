import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  // Añade más propiedades según la estructura de tu usuario
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const defaultContext: AuthContextType = {
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la aplicación
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('userData');
      
      if (token && storedUser) {
        try {
          // Aquí podrías validar el token con el backend si es necesario
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error al restaurar la sesión:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = (userData: any, token: string) => {
    // Adaptar el usuario recibido de la API al formato esperado por el contexto
    const adaptedUser: User = {
      id: userData.id,
      name: userData.name || userData.nombreUsuario || '',
      email: userData.email,
      // Puedes mapear más campos si lo necesitas
    };
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(adaptedUser));
    setUser(adaptedUser);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};