import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Form, Input, Button, DatePicker, Table, Space, Modal, Tabs, Spin, message, Select, Upload, Row, Col } from 'antd';
import { EyeOutlined, FilePdfOutlined, FileTextOutlined, LogoutOutlined, PlusOutlined, ShopOutlined } from '@ant-design/icons';
import HeaderBar from '../header/Header';
import '@ant-design/v5-patch-for-react-19';
import './Dashboard.css';
import axios from 'axios';
import { generateEquipoPdf } from '../equipoPDF/EquipoPDF';
import { useNavigate } from 'react-router-dom';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface Equipment {
  id: number;
  estadoEquipo: string;
  tipoDeEquipo: string;
  marcaEquipo: string;
  modeloEquipo: string;
  numeroDeSerieEquipo: string;
  danioEquipo: string;
  accesoriosEquipo: string;
  observacionesEquipo: string;
  fechaLlegada: string;
  fechaSalida: string | null;
  tecnico: {
    id: number;
    nombre: string;
    apellidos: string;
    numero: string;
  };
}

interface Entity {
  id: number;
  name: string;
  code: string;
  number: string;
  email: string;
}

interface Diagnostic {
  id: number;
  text: string;
  user: string;
  date: string;
}

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reportType, setReportType] = useState<'complete' | 'summary'>('complete');
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(true);
  const [negocioLoading, setNegocioLoading] = useState(false);
  const [entityLoading, setEntityLoading] = useState(false);
  const [tecnicos, setTecnicos] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [isEquipoModalOpen, setIsEquipoModalOpen] = useState(false);
  const [isNegocioModalOpen, setIsNegocioModalOpen] = useState(false);

  // Form instances
  const [equipmentForm] = Form.useForm();
  const [entityForm] = Form.useForm();
  const [diagnosticForm] = Form.useForm();
  const [negocioForm] = Form.useForm();

  const navigate = useNavigate();

  // Load data from API
  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://192.168.10.167:8000/api/equipos');
        setEquipments(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching equipments:', error);
        message.error('Error al cargar los equipos');
        setLoading(false);
      }
    };

    fetchEquipments();

    // Cargar técnicos y negocios para los selects
    const fetchCatalogos = async () => {
      try {
        const [tecnicosRes, negociosRes] = await Promise.all([
          axios.get('http://192.168.10.167:8000/api/catalogo-tecnicos'),
          axios.get('http://192.168.10.167:8000/api/catalogo-negocios'),
        ]);
        setTecnicos(tecnicosRes.data);
        setNegocios(negociosRes.data);
      } catch (e) {
        message.error('Error al cargar catálogos');
      }
    };
    fetchCatalogos();
  }, []);

  // Equipment handlers
  const handleEquipmentSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('tecnico_id', values.tecnico_id);
      formData.append('negocio_id', values.negocio_id);
      formData.append('estadoEquipo', values.estadoEquipo);
      formData.append('tipoDeEquipo', values.tipoDeEquipo);
      formData.append('marcaEquipo', values.marcaEquipo);
      formData.append('modeloEquipo', values.modeloEquipo);
      formData.append('numeroDeSerieEquipo', values.numeroDeSerieEquipo);
      formData.append('danioEquipo', values.danioEquipo || 'null');
      formData.append('accesoriosEquipo', values.accesoriosEquipo || '');
      formData.append('observacionesEquipo', values.observacionesEquipo || 'null');
      formData.append('fechaLlegada', values.fechaLlegada ? values.fechaLlegada.format('YYYY-MM-DD HH:mm:ss') : '');
      formData.append('fechaSalida', values.fechaSalida ? values.fechaSalida.format('YYYY-MM-DD HH:mm:ss') : 'null');
      formData.append('imagenesEquipo[]', ''); // Ensure this is always sent
      const response = await axios.post('http://192.168.10.167:8000/api/equipos', formData);
      setEquipments([...equipments, response.data]);
      equipmentForm.resetFields();
      message.success('Equipo registrado correctamente');
      setIsEquipoModalOpen(false);
    } catch (error: any) {
      console.error('Error creating equipment:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else if (error.response && error.response.data) {
        message.error(JSON.stringify(error.response.data));
      } else {
        message.error('Error al registrar el equipo');
      }
    }
  };

  // Entity handlers
  const handleEntitySubmit = async (values: any) => {
    setEntityLoading(true);
    try {
      const response = await axios.post('http://192.168.10.167:8000/api/entidades', {
        nombre: values.name,
        codigo: values.code,
        numero: values.number,
        correo: values.email
      });
      setEntities([...entities, response.data]);
      entityForm.resetFields();
      message.success('Entidad registrada correctamente');
    } catch (error: any) {
      console.error('Error creating entity:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error al registrar la entidad');
      }
    } finally {
      setEntityLoading(false);
    }
  };

  // Diagnostic handlers
  const handleDiagnosticSubmit = (values: any) => {
    if (!selectedEquipment) return;

    const newDiagnostic: Diagnostic = {
      id: Date.now(),
      text: values.diagnosticText,
      user: values.diagnosticUser,
      date: new Date().toISOString()
    };

    const updatedEquipments = equipments.map(eq => {
      if (eq.id === selectedEquipment.id) {
        return { ...eq, observacionesEquipo: values.diagnosticText };
      }
      return eq;
    });

    setEquipments(updatedEquipments);
    setSelectedEquipment({ ...selectedEquipment, observacionesEquipo: values.diagnosticText });
    diagnosticForm.resetFields();
    message.success('Diagnóstico registrado correctamente');
  };

  // Report handlers
  const generateReport = (type: 'complete' | 'summary') => {
    setReportType(type);
    setIsModalVisible(true);
  };

  // Helper functions
  const filteredEquipments = equipments.filter(equipment => {
    return equipment.numeroDeSerieEquipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
           equipment.modeloEquipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
           equipment.marcaEquipo.toLowerCase().includes(searchTerm.toLowerCase());
  });

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

  // Table columns
  const equipmentColumns: Array<any> = [
    {
      title: 'Número de Serie',
      dataIndex: 'numeroDeSerieEquipo',
      key: 'numeroDeSerieEquipo',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as Breakpoint[],
    },
    {
      title: 'Marca',
      dataIndex: 'marcaEquipo',
      key: 'marcaEquipo',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as Breakpoint[],
    },
    {
      title: 'Modelo',
      dataIndex: 'modeloEquipo',
      key: 'modeloEquipo',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as Breakpoint[],
    },
    {
      title: 'Fecha de Llegada',
      dataIndex: 'fechaLlegada',
      key: 'fechaLlegada',
      responsive: ['md', 'lg', 'xl'] as Breakpoint[],
      render: (date: string) => formatDate(date),
      sorter: (a: Equipment, b: Equipment) => new Date(b.fechaLlegada).getTime() - new Date(a.fechaLlegada).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipoDeEquipo',
      key: 'tipoDeEquipo',
      responsive: ['md', 'lg', 'xl'] as Breakpoint[],
    },
    {
      title: 'Estado',
      dataIndex: 'estadoEquipo',
      key: 'estadoEquipo',
      responsive: ['md', 'lg', 'xl'] as Breakpoint[],
    },
    {
      title: 'Acciones',
      key: 'actions',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as Breakpoint[],
      render: (_: any, record: Equipment) => (
        <Space>
          <span className="action-btns-responsive">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/dashboard/equipos/${record.id}`)}
              className="action-btn"
            >
              <span className="action-btn-text">Ver detalles</span>
            </Button>
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={() => generateEquipoPdf(record)}
              className="action-btn"
            >
              <span className="action-btn-text">Generar Reporte PDF</span>
            </Button>
          </span>
        </Space>
      ),
    },
  ];

  const onNegocioFinish = async (values: any) => {
    setNegocioLoading(true);
    try {
      await axios.post('http://192.168.10.167:8000/api/negocios', {
        nombreNegocio: values.nombreNegocio,
        numeroNegocio: values.numeroNegocio,
        correoNegocio: values.correoNegocio,
      });
      message.success('Negocio registrado correctamente');
      negocioForm.resetFields();
      setIsNegocioModalOpen(false);
    } catch (error) {
      message.error('Error al registrar el negocio');
    } finally {
      setNegocioLoading(false);
    }
  };

  // Tabs items configuration
  const tabItems = [
    {
      key: '1',
      label: 'Registrar Equipo',
      children: (
        <Form
          form={equipmentForm}
          layout="vertical"
          onFinish={handleEquipmentSubmit}
          encType="multipart/form-data"
        >
          <Form.Item
            label="Técnico"
            name="tecnico_id"
            rules={[{ required: true, message: 'Selecciona un técnico' }]}
          >
            <Select placeholder="Selecciona un técnico">
              {tecnicos.map((t: any) => (
                <Select.Option key={t.id} value={t.id}>{t.nombre} {t.apellidos}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Negocio"
            name="negocio_id"
            rules={[{ required: true, message: 'Selecciona un negocio' }]}
          >
            <Select placeholder="Selecciona un negocio">
              {negocios.map((n: any) => (
                <Select.Option key={n.id} value={n.id}>{n.nombreNegocio}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Estado" name="estadoEquipo" rules={[{ required: true, message: 'Estado requerido' }]}> <Select placeholder="Selecciona el estado"><Select.Option value="Recibido">Recibido</Select.Option><Select.Option value="En diagnóstico">En diagnóstico</Select.Option><Select.Option value="En reparación">En reparación</Select.Option><Select.Option value="Entregado">Entregado</Select.Option></Select> </Form.Item>
          <Form.Item label="Tipo de Equipo" name="tipoDeEquipo" rules={[{ required: true, message: 'Tipo requerido' }]}> <Input /> </Form.Item>
          <Form.Item label="Marca" name="marcaEquipo" rules={[{ required: true, message: 'Marca requerida' }]}> <Input /> </Form.Item>
          <Form.Item label="Modelo" name="modeloEquipo" rules={[{ required: true, message: 'Modelo requerido' }]}> <Input /> </Form.Item>
          <Form.Item label="Número de Serie" name="numeroDeSerieEquipo" rules={[{ required: true, message: 'Número de serie requerido' }]}> <Input /> </Form.Item>
          <Form.Item label="Accesorios" name="accesoriosEquipo"> <Input /> </Form.Item>
          <Form.Item label="Fecha de Llegada" name="fechaLlegada" rules={[{ required: true, message: 'Fecha de llegada requerida' }]}> <DatePicker showTime style={{ width: '100%' }} /> </Form.Item>
          <Form.Item label="Daño" name="danioEquipo">
            <Input />
          </Form.Item>
          <Form.Item label="Observaciones" name="observacionesEquipo">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Fecha de Salida" name="fechaSalida">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="orange-button" block loading={loading}>
              Registrar Equipo
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: '2',
      label: 'Registrar Negocio',
      children: (
        <Form
          form={negocioForm}
          layout="vertical"
          onFinish={onNegocioFinish}
        >
          <Form.Item
            label="Nombre del Negocio"
            name="nombreNegocio"
            rules={[{ required: true, message: 'Por favor ingrese el nombre del negocio' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Número del Negocio"
            name="numeroNegocio"
            rules={[{ required: true, message: 'Por favor ingrese el número del negocio' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Correo del Negocio"
            name="correoNegocio"
            rules={[{ required: true, message: 'Por favor ingrese el correo del negocio' }, { type: 'email', message: 'Por favor ingrese un correo válido' }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={negocioLoading} block>
              Registrar Negocio
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ backgroundColor: '#fff', padding: 3 }}>
        <HeaderBar currentUser={currentUser} onLogout={onLogout} />
      </Header>
      {/* Main Content */}
      <Layout>
        {/* Elimina el Sider/sidebar y deja solo el Content principal */}
        <Content style={{ padding: '2rem', backgroundColor: '#f9fafb' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Title level={3} className="equipos-title">Equipos Registrados</Title>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Input
                placeholder="Buscar equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', maxWidth: 320, minWidth: 180, fontSize: 16, boxShadow: '0 0 0 2px #fa8c1622', borderColor: '#fa8c16' }}
                allowClear
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsEquipoModalOpen(true)} title="Registrar Equipo" className="register-btn">
                <span className="btn-text-desktop">Registrar Equipo</span>
              </Button>
              <Button icon={<ShopOutlined />} onClick={() => setIsNegocioModalOpen(true)} title="Registrar Negocio" className="register-btn">
                <span className="btn-text-desktop">Registrar Negocio</span>
              </Button>
            </div>
          </div>
          
          <Card>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Spin size="large" tip="Cargando equipos..." />
              </div>
            ) : filteredEquipments.length > 0 ? (
              <Table
                columns={equipmentColumns}
                dataSource={[...filteredEquipments].sort((a, b) => new Date(b.fechaLlegada).getTime() - new Date(a.fechaLlegada).getTime())}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Text type="secondary" style={{ textAlign: 'center', display: 'block', padding: '1rem' }}>
                No hay equipos registrados
              </Text>
            )}
          </Card>
          {/* Modal para registrar equipo */}
          <Modal
            title="Registrar Equipo"
            open={isEquipoModalOpen}
            onCancel={() => setIsEquipoModalOpen(false)}
            footer={null}
            destroyOnClose
            width={800}
          >
            <Form
              form={equipmentForm}
              layout="vertical"
              onFinish={handleEquipmentSubmit}
              encType="multipart/form-data"
            >
              <div className="form-grid">
                <Form.Item
                  label="Técnico"
                  name="tecnico_id"
                  rules={[{ required: true, message: 'Selecciona un técnico' }]}
                >
                  <Select placeholder="Selecciona un técnico">
                    {tecnicos.map((t: any) => (
                      <Select.Option key={t.id} value={t.id}>{t.nombre} {t.apellidos}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Negocio"
                  name="negocio_id"
                  rules={[{ required: true, message: 'Selecciona un negocio' }]}
                >
                  <Select placeholder="Selecciona un negocio">
                    {negocios.map((n: any) => (
                      <Select.Option key={n.id} value={n.id}>{n.nombreNegocio}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="form-grid">
                <Form.Item
                  label="Estado"
                  name="estadoEquipo"
                  rules={[{ required: true, message: 'Estado requerido' }]}
                >
                  <Select placeholder="Selecciona el estado">
                    <Select.Option value="Recibido">Recibido</Select.Option>
                    <Select.Option value="En diagnóstico">En diagnóstico</Select.Option>
                    <Select.Option value="En reparación">En reparación</Select.Option>
                    <Select.Option value="Entregado">Entregado</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Tipo de Equipo"
                  name="tipoDeEquipo"
                  rules={[{ required: true, message: 'Tipo requerido' }]}
                >
                  <Input />
                </Form.Item>
              </div>
              <div className="form-grid">
                <Form.Item
                  label="Marca"
                  name="marcaEquipo"
                  rules={[{ required: true, message: 'Marca requerida' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Modelo"
                  name="modeloEquipo"
                  rules={[{ required: true, message: 'Modelo requerido' }]}
                >
                  <Input />
                </Form.Item>
              </div>
              <div className="form-grid">
                <Form.Item
                  label="Número de Serie"
                  name="numeroDeSerieEquipo"
                  rules={[{ required: true, message: 'Número de serie requerido' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Daño"
                  name="danioEquipo"
                >
                  <Input />
                </Form.Item>
              </div>
              <div className="form-grid">
                <Form.Item
                  label="Accesorios"
                  name="accesoriosEquipo"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Fecha de Llegada"
                  name="fechaLlegada"
                  rules={[{ required: true, message: 'Fecha de llegada requerida' }]}
                >
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              </div>
              <div className="form-grid">
                <Form.Item
                  label="Fecha de Salida"
                  name="fechaSalida"
                >
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              </div>
              <Form.Item
                label="Observaciones"
                name="observacionesEquipo"
              >
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="orange-button" block loading={loading}>
                  Registrar Equipo
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          {/* Modal para registrar negocio */}
          <Modal
            title="Registrar Negocio"
            open={isNegocioModalOpen}
            onCancel={() => setIsNegocioModalOpen(false)}
            footer={null}
            destroyOnClose
          >
            <Form
              form={negocioForm}
              layout="vertical"
              onFinish={onNegocioFinish}
            >
              <Form.Item
                label="Nombre del Negocio"
                name="nombreNegocio"
                rules={[{ required: true, message: 'Por favor ingrese el nombre del negocio' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Número del Negocio"
                name="numeroNegocio"
                rules={[{ required: true, message: 'Por favor ingrese el número del negocio' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Correo del Negocio"
                name="correoNegocio"
                rules={[{ required: true, message: 'Por favor ingrese el correo del negocio' }, { type: 'email', message: 'Por favor ingrese un correo válido' }]}
              >
                <Input type="email" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={negocioLoading} block>
                  Registrar Negocio
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
      {/* PDF Modal */}
      <Modal
        title={reportType === 'complete' ? 'Reporte Completo' : 'Reporte Resumido'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="80%"
        style={{ top: 20 }}
      >
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <Text>Generando reporte PDF...</Text>
          <div style={{ marginTop: '1rem' }}>
            <Button type="primary" loading className="orange-button">
              Procesando...
            </Button>
          </div>
        </div>
      </Modal>
      {/* Footer */}
      <Footer style={{ textAlign: 'center' }}>
        COSII ©2025 - Departamento de Informatica.
      </Footer>
    </Layout>
  );
};

export default Dashboard;