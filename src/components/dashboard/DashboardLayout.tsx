import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Form, Input, Button, DatePicker, Table, Space, Modal, Tabs, Spin, message } from 'antd';
import { EyeOutlined, FilePdfOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons';
import HeaderBar from '../header/Header';
import '@ant-design/v5-patch-for-react-19';
import './Dashboard.css';
import axios from 'axios';
import { generateEquipoPdf } from '../equipoPDF/EquipoPDF';
import { useNavigate } from 'react-router-dom';

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

  // Form instances
  const [equipmentForm] = Form.useForm();
  const [entityForm] = Form.useForm();
  const [diagnosticForm] = Form.useForm();

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
  }, []);

  // Equipment handlers
  const handleEquipmentSubmit = async (values: any) => {
    try {
      const response = await axios.post('http://192.168.10.167:8000/api/equipos', {
        ...values,
        registrationDate: values.registrationDate.format('YYYY-MM-DD'),
      });
      
      setEquipments([...equipments, response.data]);
      equipmentForm.resetFields();
      message.success('Equipo registrado correctamente');
    } catch (error) {
      console.error('Error creating equipment:', error);
      message.error('Error al registrar el equipo');
    }
  };

  // Entity handlers
  const handleEntitySubmit = (values: any) => {
    const newEntity: Entity = {
      id: Date.now(),
      name: values.name,
      code: values.code,
      number: values.number,
      email: values.email
    };

    setEntities([...entities, newEntity]);
    entityForm.resetFields();
    message.success('Entidad registrada correctamente');
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
  const equipmentColumns = [
    {
      title: 'Número de Serie',
      dataIndex: 'numeroDeSerieEquipo',
      key: 'numeroDeSerieEquipo',
    },
    {
      title: 'Estado',
      dataIndex: 'estadoEquipo',
      key: 'estado',
    },
    {
      title: 'Marca',
      dataIndex: 'marcaEquipo',
      key: 'marca',
    },
    {
      title: 'Modelo',
      dataIndex: 'modeloEquipo',
      key: 'modeloEquipo',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipoDeEquipo',
      key: 'tipoDeEquipo',
    },
    {
      title: 'Fecha de Llegada',
      dataIndex: 'fechaLlegada',
      key: 'fechaLlegada',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Técnico',
      key: 'tecnico',
      render: (_: any, record: Equipment) => (
        <span>{record.tecnico.nombre} {record.tecnico.apellidos}</span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Equipment) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/dashboard/equipos/${record.id}`)}
          >
            Ver detalles
          </Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => generateEquipoPdf(record)}
          >
            Generar Reporte PDF
          </Button>
        </Space>
      ),
    },
  ];

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
        >
          <Form.Item
            label="Número de Serie"
            name="numeroDeSerieEquipo"
            rules={[{ required: true, message: 'Por favor ingrese el número de serie' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Marca"
            name="marcaEquipo"
            rules={[{ required: true, message: 'Por favor ingrese la marca' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Modelo"
            name="modeloEquipo"
            rules={[{ required: true, message: 'Por favor ingrese el modelo' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Tipo de Equipo"
            name="tipoDeEquipo"
            rules={[{ required: true, message: 'Por favor ingrese el tipo de equipo' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Fecha de Registro"
            name="registrationDate"
            rules={[{ required: true, message: 'Por favor seleccione la fecha' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" className="orange-button" block>
              Registrar Equipo
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: '2',
      label: 'Registrar Entidad',
      children: (
        <Form
          form={entityForm}
          layout="vertical"
          onFinish={handleEntitySubmit}
        >
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Código"
            name="code"
            rules={[{ required: true, message: 'Por favor ingrese el código' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Número"
            name="number"
            rules={[{ required: true, message: 'Por favor ingrese el número' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Correo"
            name="email"
            rules={[
              { required: true, message: 'Por favor ingrese el correo' },
              { type: 'email', message: 'Por favor ingrese un correo válido' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" className="orange-button" block>
              Registrar Entidad
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
        {/* Left Sidebar - Forms */}
        <Sider
          width={350}
          theme="light"
          style={{
            padding: '2rem 1rem',
            borderRight: '1px solid #e0e0e0',
            background: '#fff',
          }}
        >
          <Tabs 
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarStyle={{ marginBottom: 24 }}
            items={tabItems}
          />
        </Sider>

        {/* Main Content - Equipment List */}
        <Content style={{ padding: '2rem', backgroundColor: '#f9fafb' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Title level={4}>Equipos Registrados</Title>
            <Input
              placeholder="Buscar equipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: '400px' }}
            />
          </div>
          
          <Card>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Spin size="large" tip="Cargando equipos..." />
              </div>
            ) : filteredEquipments.length > 0 ? (
              <Table
                columns={equipmentColumns}
                dataSource={filteredEquipments}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Text type="secondary" style={{ textAlign: 'center', display: 'block', padding: '1rem' }}>
                No hay equipos registrados
              </Text>
            )}
          </Card>
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