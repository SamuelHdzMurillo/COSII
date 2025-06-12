import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = (username: string) => {
    setUser(username);
    navigate('/');
  };

  const logout = () => {
    setUser(null);
    navigate('/login');
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };
};