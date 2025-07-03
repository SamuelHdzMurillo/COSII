import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Spin, Layout } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import { generateEquipoPdf } from '../equipoPDF/EquipoPDF';
import HeaderBar from '../header/Header';
import axios from 'axios';

const { Title, Text } = Typography;
const { Header, Content, Footer } = Layout;

const EquipamentsDatails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [equipo, setEquipo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEquipo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://192.168.10.167:8000/api/equipos`);
        const equipos = response.data;
        const equipoEncontrado = equipos.find((eq: any) => eq.id.toString() === id);
        
        if (equipoEncontrado) {
          setEquipo(equipoEncontrado);
        } else {
          setEquipo(null);
        }
      } catch (error) {
        console.error('Error fetching equipo:', error);
        setEquipo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipo();
  }, [id]);

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ backgroundColor: '#fff', padding: 3 }}>
          <HeaderBar />
        </Header>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="Cargando equipo..." />
        </Content>
      </Layout>
    );
  }

  if (!equipo) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ backgroundColor: '#fff', padding: 3 }}>
          <HeaderBar />
        </Header>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Text type="danger">Equipo no encontrado</Text>
          <br />
          <Button type="link" onClick={() => navigate('/dashboard')}>
            Volver al dashboard
          </Button>
        </Content>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ backgroundColor: '#fff', padding: 3 }}>
        <HeaderBar />
      </Header>

      {/* Main Content */}
      <Content style={{ backgroundColor: '#f9fafb' }}>
        <div style={{ padding: '2rem' }}>
          <Button type="link" onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem' }}>
            ← Volver al dashboard
          </Button>
          <Card title="Información del Equipo" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <Text type="secondary">Número de Serie</Text>
                <Title level={5}>{equipo.numeroDeSerieEquipo}</Title>
              </div>
              <div>
                <Text type="secondary">Marca</Text>
                <Title level={5}>{equipo.marcaEquipo}</Title>
              </div>
              <div>
                <Text type="secondary">Modelo</Text>
                <Title level={5}>{equipo.modeloEquipo}</Title>
              </div>
              <div>
                <Text type="secondary">Tipo</Text>
                <Title level={5}>{equipo.tipoDeEquipo}</Title>
              </div>
              <div>
                <Text type="secondary">Estado</Text>
                <Title level={5}>{equipo.estadoEquipo}</Title>
              </div>
              <div>
                <Text type="secondary">Fecha de Llegada</Text>
                <Title level={5}>{formatDate(equipo.fechaLlegada)}</Title>
              </div>
              <div>
                <Text type="secondary">Fecha de Salida</Text>
                <Title level={5}>{equipo.fechaSalida ? formatDate(equipo.fechaSalida) : 'No ha salido'}</Title>
              </div>
              <div>
                <Text type="secondary">Técnico</Text>
                <Title level={5}>{equipo.tecnico?.nombre} {equipo.tecnico?.apellidos}</Title>
              </div>
              <div>
                <Text type="secondary">Daño reportado</Text>
                <Title level={5}>{equipo.danioEquipo}</Title>
              </div>
              <div>
                <Text type="secondary">Accesorios</Text>
                <Title level={5}>{equipo.accesoriosEquipo}</Title>
              </div>
            </div>
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={() => generateEquipoPdf(equipo)}
              style={{ marginTop: '1rem' }}
            >
              Generar Reporte PDF
            </Button>
          </Card>
          <Card title="Observaciones">
            {equipo.observacionesEquipo ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <Card style={{ backgroundColor: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <Text strong>{equipo.tecnico?.nombre} {equipo.tecnico?.apellidos}</Text>
                    <Text type="secondary">{formatDateTime(equipo.fechaLlegada)}</Text>
                  </div>
                  <Text>{equipo.observacionesEquipo}</Text>
                </Card>
              </div>
            ) : (
              <Text type="secondary" style={{ textAlign: 'center', display: 'block', padding: '1rem' }}>
                No hay observaciones registradas
              </Text>
            )}
          </Card>
        </div>
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: 'center', backgroundColor: '#f0f2f5' }}>
        COSII - Control de órdenes y servicios e inventario interno ©2024
      </Footer>
    </Layout>
  );
};

export default EquipamentsDatails;
