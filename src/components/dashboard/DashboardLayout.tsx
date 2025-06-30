import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Form, Input, Button, DatePicker, Table, Space, Modal, Tabs, Spin, message } from 'antd';
import { EyeOutlined, FilePdfOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons';
import HeaderBar from '../header/Header';
import '@ant-design/v5-patch-for-react-19';
import './Dashboard.css';
import axios from 'axios';
import jsPDF from 'jspdf';

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

  // View handlers
  const showEquipmentDetails = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setViewMode('details');
  };

  const backToList = () => {
    setViewMode('list');
    setSelectedEquipment(null);
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

  // Función para generar un PDF con los datos de un equipo
  const handleEquipoPdf = async (equipo: Equipment) => {
    const doc = new jsPDF({ format: 'letter', unit: 'mm' });
    // Cargar logo como base64
    const logoUrl = '/src/assets/logoCecyte.png';
    const getBase64FromUrl = async (url: string) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };
    const logoBase64 = await getBase64FromUrl(logoUrl);
    // Logo
    doc.addImage(logoBase64, 'PNG', 35, 10, 30, 30);

    // Nombre de la escuela en varias líneas, grande y negrita, alineado a la derecha del logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    const schoolLines = [
      'Colegio de Estudios Científicos',
      'y Tecnológicos del Estado de BCS'
    ];
    let textY = 18;
    schoolLines.forEach(line => {
      doc.text(line, 70, textY, { align: 'left' });
      textY += 8;
    });

    // Departamento debajo, más pequeño
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(15);
    doc.text('Departamento de Informática', 70, textY + 2, { align: 'left' });

    // Fecha y número de orden
    const fecha = new Date().toLocaleDateString('es-MX');
    doc.setFontSize(10);
    doc.text(`Fecha: ${fecha}`, 15, 50);
    doc.text(`No. Orden de Servicio: ${equipo.id}`, 155, 50);
    // Tabla de datos del equipo con fondo verde y bordes
    let y = 60;
    const pageWidth = 210; // A4 width in mm
    const margin = 15;
    const tableWidth = pageWidth - margin * 2;
    const col1Width = 50;
    const col2Width = tableWidth - col1Width;
    // Fondo y título de la tabla
    doc.setFillColor(0, 180, 80); // verde
    doc.rect(margin, y, tableWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255,255,255);
    doc.setFontSize(10); // Letra más chica para títulos de tabla
    doc.text('Datos del Equipo', pageWidth / 2, y + 5.5, { align: 'center' });
    doc.setTextColor(0,0,0);
    y += 10;
    // Datos del equipo en filas con bordes
    const rows = [
      ['Número de Serie', equipo.numeroDeSerieEquipo],
      ['Estado', equipo.estadoEquipo],
      ['Marca', equipo.marcaEquipo],
      ['Modelo', equipo.modeloEquipo],
      ['Tipo', equipo.tipoDeEquipo],
      ['Fecha de Llegada', equipo.fechaLlegada],
      ['Técnico', `${equipo.tecnico.nombre} ${equipo.tecnico.apellidos}`],
      ['Daño', equipo.danioEquipo],
      ['Accesorios', equipo.accesoriosEquipo]
    ];
    doc.setFontSize(10);
    rows.forEach(([label, value]) => {
      doc.setDrawColor(180, 180, 180);
      doc.rect(margin, y, col1Width, 8); // celda 1
      doc.rect(margin + col1Width, y, col2Width, 8); // celda 2
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin + 2, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), margin + col1Width + 2, y + 5);
      y += 8;
    });
    // Espacio antes de trabajo realizado
    y += 8;
    // Tabla de trabajo realizado con fondo verde y bordes
    doc.setFillColor(0, 180, 80); // verde
    doc.rect(margin, y, tableWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255,255,255);
    doc.setFontSize(10); // Letra más chica para títulos de tabla
    doc.text('Trabajo realizado', pageWidth / 2, y + 5.5, { align: 'center' });
    doc.setTextColor(0,0,0);
    y += 10;
    // Fila de trabajo realizado
    doc.setDrawColor(180, 180, 180);
    doc.rect(margin, y, tableWidth, 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(equipo.observacionesEquipo || '_________________________', margin + 2, y + 7, { maxWidth: tableWidth - 4 });
    y += 24;
    // Firmas y responsables en formato de tabla
    const tableY = y;
    // Encabezados
    doc.setFont('helvetica', 'bold');
    doc.text('Responsable del área', 30, tableY);
    doc.text('Verificado y diagnosticado por', 130, tableY);
    // Nombres centrados
    doc.setFont('helvetica', 'normal');
    doc.text('Ing. Daniel Carillo Cortés', 47.5, tableY + 8, { align: 'center' });
    doc.text(`${equipo.tecnico.nombre} ${equipo.tecnico.apellidos}`, 152.5, tableY + 8, { align: 'center' });
    // Líneas para firmas
    doc.line(15, tableY + 20, 80, tableY + 20); // Responsable
    doc.line(110, tableY + 20, 195, tableY + 20); // Técnico
    // Etiquetas de firma
    doc.setFontSize(9);
    doc.text('Firma Responsable', 47.5, tableY + 25, { align: 'center' });
    doc.text('Firma Técnico', 152.5, tableY + 25, { align: 'center' });
    window.open(doc.output('bloburl'), '_blank');
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
            onClick={() => showEquipmentDetails(record)}
          >
            Ver detalles
          </Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => handleEquipoPdf(record)}
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
      {viewMode === 'list' ? (
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
                    <Text type="secondary">Número de Serie</Text>
                    <Title level={5}>{selectedEquipment.numeroDeSerieEquipo}</Title>
                  </div>
                  <div>
                    <Text type="secondary">Marca</Text>
                    <Title level={5}>{selectedEquipment.marcaEquipo}</Title>
                  </div>
                  <div>
                    <Text type="secondary">Modelo</Text>
                    <Title level={5}>{selectedEquipment.modeloEquipo}</Title>
                  </div>
                  <div>
                    <Text type="secondary">Tipo</Text>
                    <Title level={5}>{selectedEquipment.tipoDeEquipo}</Title>
                  </div>
                  <div>
                    <Text type="secondary">Estado</Text>
                    <Title level={5}>{selectedEquipment.estadoEquipo}</Title>
                  </div>
                  <div>
                    <Text type="secondary">Fecha de Llegada</Text>
                    <Title level={5}>{formatDate(selectedEquipment.fechaLlegada)}</Title>
                  </div>
                  <div>
                    <Text type="secondary">Fecha de Salida</Text>
                    <Title level={5}>{selectedEquipment.fechaSalida ? formatDate(selectedEquipment.fechaSalida) : 'No ha salido'}</Title>
                  </div>
                  <div>
                    <Text type="secondary">Técnico</Text>
                    <Title level={5}>{selectedEquipment.tecnico.nombre} {selectedEquipment.tecnico.apellidos}</Title>
                  </div>
                  <div>
                    <Text type="secondary">Daño reportado</Text>
                    <Title level={5}>{selectedEquipment.danioEquipo}</Title>
                  </div>
                  <div>
                    <Text type="secondary">Accesorios</Text>
                    <Title level={5}>{selectedEquipment.accesoriosEquipo}</Title>
                  </div>
                </div>
                
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={() => handleEquipoPdf(selectedEquipment)}
                >
                  Generar Reporte PDF
                </Button>
              </Card>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {/* Diagnostic History */}
                <Card title="Observaciones">
                  {selectedEquipment.observacionesEquipo ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      <Card style={{ backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <Text strong>{selectedEquipment.tecnico.nombre} {selectedEquipment.tecnico.apellidos}</Text>
                          <Text type="secondary">{formatDateTime(selectedEquipment.fechaLlegada)}</Text>
                        </div>
                        <Text>{selectedEquipment.observacionesEquipo}</Text>
                      </Card>
                    </div>
                  ) : (
                    <Text type="secondary" style={{ textAlign: 'center', display: 'block', padding: '1rem' }}>
                      No hay observaciones registradas
                    </Text>
                  )}
                </Card>
                
                {/* New Diagnostic Form */}
                <Card title="Registrar Nuevas Observaciones">
                  <Form
                    form={diagnosticForm}
                    layout="vertical"
                    onFinish={handleDiagnosticSubmit}
                  >
                    <Form.Item
                      label="Observaciones"
                      name="diagnosticText"
                      rules={[{ required: true, message: 'Por favor ingrese las observaciones' }]}
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
                        Guardar Observaciones
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