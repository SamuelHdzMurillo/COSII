import React from 'react';
import { Button, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import logoPagina from '../../assets/logoPagina.png';
import './Header.css';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface HeaderProps {
  // Props opcionales para compatibilidad con código existente
  currentUser?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser: propCurrentUser, onLogout: propOnLogout }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Usar el usuario del contexto o el proporcionado por props
  const displayName = user?.name || propCurrentUser || 'Usuario';
  
  const handleLogout = () => {
    logout();
    navigate('/');
    // También llamar al onLogout de props si existe, para compatibilidad
    if (propOnLogout) propOnLogout();
  };
  return (
    <header className="header-container">
      <div className="header-content">
        <div className="logo-container">
          <img 
            src={logoPagina} 
            alt="LogoCecyte" 
            className="logo-image"
          />
          <h1 className="system-name">COSII</h1>
        </div>
        <div className="user-actions">
          <Text className="username">Usuario: {displayName}</Text>
          <Button 
            type="primary" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            className="orange-button logout-button"
          >
            <span className="logout-text">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;