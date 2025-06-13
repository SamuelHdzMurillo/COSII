import React from 'react';
import { Button, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import logoPagina from '../../assets/logoPagina.png';
import './Header.css';

const { Text } = Typography;

interface HeaderProps {
  currentUser: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
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
          <Text className="username">Usuario: {currentUser}</Text>
          <Button 
            type="primary" 
            icon={<LogoutOutlined />} 
            onClick={onLogout}
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