import React from 'react';
import { Button, Typography } from 'antd';
import { LogoutOutlined, PlusCircleOutlined, UserOutlined } from '@ant-design/icons';
import logoPagina from '../../assets/logoPagina.png';
import './Header.css';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Input, message } from 'antd';
import axios from 'axios';

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
  
  const [modalOpen, setModalOpen] = React.useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    // También llamar al onLogout de props si existe, para compatibilidad
    if (propOnLogout) propOnLogout();
  };

  const handleAddTechnician = () => setModalOpen(true);
  const handleCancel = () => setModalOpen(false);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nombre', values.nombre);
      formData.append('apellidos', values.apellidos);
      formData.append('numero', values.numero);
      await axios.post('http://192.168.10.167:8000/api/tecnicos', formData);
      message.success('Técnico registrado correctamente');
      form.resetFields();
      setModalOpen(false);
    } catch (error) {
      message.error('Error al registrar el técnico');
    } finally {
      setLoading(false);
    }
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
            type="default"
            icon={<UserOutlined />}
            onClick={handleAddTechnician}
            style={{ marginRight: 8 }}
          >
            <PlusCircleOutlined style={{ color: '#fa8c16', marginLeft: 4 }} />
          </Button>
          <Button 
            type="primary" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            className="orange-button logout-button"
          >
            <span className="logout-text">Cerrar Sesión</span>
          </Button>
          <Modal
            title="Registrar Técnico"
            open={modalOpen}
            onCancel={handleCancel}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
            >
              <Form.Item
                label="Nombre"
                name="nombre"
                rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Apellidos"
                name="apellidos"
                rules={[{ required: true, message: 'Por favor ingrese los apellidos' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Número"
                name="numero"
                rules={[{ required: true, message: 'Por favor ingrese el número' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Registrar Técnico
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </header>
  );
};

export default Header;