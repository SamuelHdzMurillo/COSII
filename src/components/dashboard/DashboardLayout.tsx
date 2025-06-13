import React from 'react';
import { Layout, Typography, Card, Form, Input, Button, DatePicker, Table, Space, Modal } from 'antd';
import { EyeOutlined, FilePdfOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons';
import HeaderBar from '../header/Header';
import './Dashboard.css';
const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface Equipment {
  id: string;
  inventoryNumber: string;
  modelSerial: string;
  registrationDate: string;
  locationId: string;
  diagnostics: Diagnostic[];
}

interface Diagnostic {
  id: string;
  text: string;
  user: string;
  date: string;
}

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const [equipments, setEquipments] = React.useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = React.useState<Equipment | null>(null);
  const [viewMode, setViewMode] = React.useState<'list' | 'details'>('list');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [reportType, setReportType] = React.useState<'complete' | 'summary'>('complete');

  // Form instances
  const [equipmentForm] = Form.useForm();
  const [diagnosticForm] = Form.useForm();

  // Load equipments from localStorage on component mount
  React.useEffect(() => {
    const storedEquipments = localStorage.getItem('equipments');
    if (storedEquipments) {
      setEquipments(JSON.parse(storedEquipments));
    } else {
      localStorage.setItem('equipments', JSON.stringify([]));
    }
  }, []);

  // Handle equipment registration
  const handleEquipmentSubmit = (values: any) => {
    const newEquipment: Equipment = {
      id: Date.now().toString(),
      inventoryNumber: values.inventoryNumber,
      modelSerial: values.modelSerial,
      registrationDate: values.registrationDate.format('YYYY-MM-DD'),
      locationId: values.locationId,
      diagnostics: []
    };

    const updatedEquipments = [...equipments, newEquipment];
    setEquipments(updatedEquipments);
    localStorage.setItem('equipments', JSON.stringify(updatedEquipments));
    equipmentForm.resetFields();
    Modal.success({ title: 'Éxito', content: 'Equipo registrado correctamente' });
  };

  // Handle diagnostic registration
  const handleDiagnosticSubmit = (values: any) => {
    if (!selectedEquipment) return;

    const newDiagnostic: Diagnostic = {
      id: Date.now().toString(),
      text: values.diagnosticText,
      user: values.diagnosticUser,
      date: new Date().toISOString()
    };

    const updatedEquipments = equipments.map(eq => {
      if (eq.id === selectedEquipment.id) {
        return { ...eq, diagnostics: [...eq.diagnostics, newDiagnostic] };
      }
      return eq;
    });

    setEquipments(updatedEquipments);
    setSelectedEquipment({ ...selectedEquipment, diagnostics: [...selectedEquipment.diagnostics, newDiagnostic] });
    localStorage.setItem('equipments', JSON.stringify(updatedEquipments));
    diagnosticForm.resetFields();
    Modal.success({ title: 'Éxito', content: 'Diagnóstico registrado correctamente' });
  };

  // Show equipment details
  const showEquipmentDetails = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setViewMode('details');
  };

  // Back to list view
  const backToList = () => {
    setViewMode('list');
    setSelectedEquipment(null);
  };

  // Generate report
  const generateReport = (type: 'complete' | 'summary') => {
    setReportType(type);
    setIsModalVisible(true);
  };

  // Filter equipment based on search term
  const filteredEquipments = equipments.filter(equipment => {
    return equipment.inventoryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           equipment.modelSerial.toLowerCase().includes(searchTerm.toLowerCase()) ||
           equipment.locationId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Format date and time for display
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES');
  };

  // Equipment list columns
  const equipmentColumns = [
    {
      title: 'Número de Inventario',
      dataIndex: 'inventoryNumber',
      key: 'inventoryNumber',
    },
    {
      title: 'Modelo/Serie',
      dataIndex: 'modelSerial',
      key: 'modelSerial',
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Ubicación/ID',
      dataIndex: 'locationId',
      key: 'locationId',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Equipment) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => showEquipmentDetails(record)}
        >
          Ver detalles
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ backgroundColor: '#fff', padding: 3 }}>
        <HeaderBar currentUser={currentUser} onLogout={onLogout} />
      </Header>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <Layout>
          {/* Left Sidebar - Equipment Form */}
          <Sider
            width={350}
            theme="light"
            style={{
              padding: '2rem 1rem',
              borderRight: '1px solid #e0e0e0',
              background: '#fff',
            }}
          >
            <Title level={4}>Registrar Nuevo Equipo</Title>
            <Form
              form={equipmentForm}
              layout="vertical"
              onFinish={handleEquipmentSubmit}
            >
              <Form.Item
                label="Número de Inventario"
                name="inventoryNumber"
                rules={[{ required: true, message: 'Por favor ingrese el número de inventario' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                label="Modelo y Serie"
                name="modelSerial"
                rules={[{ required: true, message: 'Por favor ingrese el modelo y serie' }]}
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
              
              <Form.Item
                label="Ubicación/ID"
                name="locationId"
                rules={[{ required: true, message: 'Por favor ingrese la ubicación' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" className="orange-button" block>
                  Registrar Equipo
                </Button>
              </Form.Item>
            </Form>
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
              {filteredEquipments.length > 0 ? (
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
      ) : (
        /* Equipment Details View */
        <Content style={{ padding: '2rem', backgroundColor: '#f9fafb' }}>
          <Button 
            type="link" 
            onClick={backToList}
            style={{ marginBottom: '1rem' }}
          >
            ← Volver a la lista
          </Button>
          
          {selectedEquipment && (
            <>
              <Card title="Información del Equipo" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <Text type="secondary">Número de Inventario</Text>
                    <Title level={5}>{selectedEquipment.inventoryNumber}</Title>
                  </div>
                  <div>
                    <Text type="secondary">Modelo y Serie</Text>
                    <Title level={5}>{selectedEquipment.modelSerial}</Title>
                  </div>
                  <div>
                    <Text type="secondary">Fecha de Registro</Text>
                    <Title level={5}>{formatDate(selectedEquipment.registrationDate)}</Title>
                  </div>
                  <div>
                    <Text type="secondary">Ubicación/ID</Text>
                    <Title level={5}>{selectedEquipment.locationId}</Title>
                  </div>
                </div>
                
                <Space style={{ marginTop: '1.5rem' }}>
                  <Button 
                    type="primary" className="orange-button"
                    icon={<FilePdfOutlined />}
                    onClick={() => generateReport('complete')}
                  >
                    Reporte Completo
                  </Button>
                  <Button 
                    type="default" 
                    icon={<FileTextOutlined />}
                    onClick={() => generateReport('summary')}
                  >
                    Reporte Resumido
                  </Button>
                </Space>
              </Card>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {/* Diagnostic History */}
                <Card title="Historial de Diagnósticos">
                  {selectedEquipment.diagnostics.length > 0 ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {selectedEquipment.diagnostics.map(diagnostic => (
                        <Card key={diagnostic.id} style={{ backgroundColor: '#fafafa' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <Text strong>{diagnostic.user}</Text>
                            <Text type="secondary">{formatDateTime(diagnostic.date)}</Text>
                          </div>
                          <Text>{diagnostic.text}</Text>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Text type="secondary" style={{ textAlign: 'center', display: 'block', padding: '1rem' }}>
                      No hay diagnósticos registrados
                    </Text>
                  )}
                </Card>
                
                {/* New Diagnostic Form */}
                <Card title="Registrar Nuevo Diagnóstico">
                  <Form
                    form={diagnosticForm}
                    layout="vertical"
                    onFinish={handleDiagnosticSubmit}
                  >
                    <Form.Item
                      label="Diagnóstico"
                      name="diagnosticText"
                      rules={[{ required: true, message: 'Por favor ingrese el diagnóstico' }]}
                    >
                      <TextArea rows={4} />
                    </Form.Item>
                    
                    <Form.Item
                      label="Nombre del Técnico"
                      name="diagnosticUser"
                      rules={[{ required: true, message: 'Por favor ingrese su nombre' }]}
                    >
                      <Input />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button type="primary" className="orange-button" htmlType="submit" block>
                        Guardar Diagnóstico
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </div>
            </>
          )}
        </Content>
      )}

      {/* PDF Modal */}
      <Modal
        title={reportType === 'complete' ? 'Reporte Completo' : 'Reporte Resumido'}
        visible={isModalVisible}
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