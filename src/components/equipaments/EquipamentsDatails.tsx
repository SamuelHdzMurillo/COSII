import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Spin, Layout, Input } from 'antd';
import { FilePdfOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
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
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState<any>({});
  const [saving, setSaving] = useState(false);

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

  const handleEdit = () => {
    setEditValues({ ...equipo });
    setEditMode(true);
  };
  const handleCancelEdit = () => {
    setEditMode(false);
  };
  const handleChange = (field: string, value: any) => {
    setEditValues((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`http://192.168.10.167:8000/api/equipos/${equipo.id}`, editValues);
      setEquipo({ ...editValues });
      setEditMode(false);
    } catch (error) {
      // Puedes mostrar un mensaje de error aquí
    } finally {
      setSaving(false);
    }
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
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Información del Equipo</span>
                {!editMode ? (
                  <Button icon={<EditOutlined />} onClick={handleEdit} size="small" type="default">
                    Editar información
                  </Button>
                ) : (
                  <span>
                    <Button icon={<SaveOutlined />} onClick={handleSave} size="small" type="primary" loading={saving} style={{ marginRight: 8 }}>
                      Guardar
                    </Button>
                    <Button icon={<CloseOutlined />} onClick={handleCancelEdit} size="small" type="default">
                      Cancelar
                    </Button>
                  </span>
                )}
              </div>
            }
            style={{ marginBottom: '1.5rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {editMode ? (
                <>
                  <div>
                    <Text type="secondary">Número de Serie</Text>
                    <Input value={editValues.numeroDeSerieEquipo} onChange={e => handleChange('numeroDeSerieEquipo', e.target.value)} />
                  </div>
                  <div>
                    <Text type="secondary">Marca</Text>
                    <Input value={editValues.marcaEquipo} onChange={e => handleChange('marcaEquipo', e.target.value)} />
                  </div>
                  <div>
                    <Text type="secondary">Modelo</Text>
                    <Input value={editValues.modeloEquipo} onChange={e => handleChange('modeloEquipo', e.target.value)} />
                  </div>
                  <div>
                    <Text type="secondary">Tipo</Text>
                    <Input value={editValues.tipoDeEquipo} onChange={e => handleChange('tipoDeEquipo', e.target.value)} />
                  </div>
                  <div>
                    <Text type="secondary">Estado</Text>
                    <Input value={editValues.estadoEquipo} onChange={e => handleChange('estadoEquipo', e.target.value)} />
                  </div>
                  <div>
                    <Text type="secondary">Fecha de Llegada</Text>
                    <Input value={editValues.fechaLlegada} onChange={e => handleChange('fechaLlegada', e.target.value)} />
                  </div>
                  <div>
                    <Text type="secondary">Fecha de Salida</Text>
                    <Input value={editValues.fechaSalida || ''} onChange={e => handleChange('fechaSalida', e.target.value)} />
                  </div>
                  <div>
                    <Text type="secondary">Técnico</Text>
                    <Input value={editValues.tecnico?.nombre + ' ' + (editValues.tecnico?.apellidos || '')} disabled />
                  </div>
                  <div>
                    <Text type="secondary">Daño reportado</Text>
                    <Input value={editValues.danioEquipo} onChange={e => handleChange('danioEquipo', e.target.value)} />
                  </div>
                  <div>
                    <Text type="secondary">Accesorios</Text>
                    <Input value={editValues.accesoriosEquipo} onChange={e => handleChange('accesoriosEquipo', e.target.value)} />
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
            {!editMode && (
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={() => generateEquipoPdf(equipo)}
                style={{ marginTop: '1rem' }}
              >
                Generar Reporte PDF
              </Button>
            )}
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
              COSII ©2025 - Departamento de Informatica.
      </Footer>
    </Layout>
  );
};

export default EquipamentsDatails;
