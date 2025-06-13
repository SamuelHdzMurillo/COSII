import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Typography, 
  Divider, 
  List, 
  Form, 
  Input,
  Modal
} from 'antd';
import { 
  ArrowLeftOutlined, 
  FilePdfOutlined, 
  FileTextOutlined 
} from '@ant-design/icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const { Title, Text } = Typography;

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

const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [diagnosticForm] = Form.useForm();
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportType, setReportType] = useState<'complete' | 'summary'>('complete');

  useEffect(() => {
    if (id) {
      loadEquipment(id);
    }
  }, [id]);

  const loadEquipment = (equipmentId: string) => {
    setLoading(true);
    setTimeout(() => {
      const storedEquipments = localStorage.getItem('equipments');
      if (storedEquipments) {
        const equipments: Equipment[] = JSON.parse(storedEquipments);
        const foundEquipment = equipments.find(eq => eq.id === equipmentId);
        if (foundEquipment) {
          setEquipment(foundEquipment);
        }
      }
      setLoading(false);
    }, 500);
  };

  const handleAddDiagnostic = (values: { text: string; user: string }) => {
    if (!equipment) return;

    const newDiagnostic = {
      id: Date.now().toString(),
      text: values.text,
      user: values.user,
      date: new Date().toISOString(),
    };

    const updatedEquipment = {
      ...equipment,
      diagnostics: [...equipment.diagnostics, newDiagnostic],
    };

    const storedEquipments = localStorage.getItem('equipments');
    if (storedEquipments) {
      const equipments: Equipment[] = JSON.parse(storedEquipments);
      const updatedEquipments = equipments.map(eq =>
        eq.id === equipment.id ? updatedEquipment : eq
      );
      localStorage.setItem('equipments', JSON.stringify(updatedEquipments));
      setEquipment(updatedEquipment);
      diagnosticForm.resetFields();
    }
  };

  const handleGenerateReport = (type: 'complete' | 'summary') => {
    setReportType(type);
    setReportModalVisible(true);
  };

  if (!equipment) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/dashboard')}
        className="text-indigo-600 hover:text-indigo-800 mb-4"
      >
        Volver
      </Button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <Title level={4} className="text-xl font-semibold text-gray-800 mb-4">
          Información del Equipo
        </Title>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Text type="secondary" className="text-sm">Número de Inventario</Text>
            <Text className="text-lg font-medium block">{equipment.inventoryNumber}</Text>
          </div>
          <div>
            <Text type="secondary" className="text-sm">Modelo y Serie</Text>
            <Text className="text-lg font-medium block">{equipment.modelSerial}</Text>
          </div>
          <div>
            <Text type="secondary" className="text-sm">Fecha de Registro</Text>
            <Text className="text-lg font-medium block">
              {format(new Date(equipment.registrationDate), 'dd/MM/yyyy', { locale: es })}
            </Text>
          </div>
          <div>
            <Text type="secondary" className="text-sm">Ubicación/ID</Text>
            <Text className="text-lg font-medium block">{equipment.locationId}</Text>
          </div>
        </div>
        
        <Divider />
        
        <div className="flex gap-4">
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => handleGenerateReport('complete')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Generar Reporte Completo
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => handleGenerateReport('summary')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Generar Reporte Resumido
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostic History */}
        <Card className="rounded-lg shadow">
          <Title level={4} className="text-xl font-semibold text-gray-800 mb-4">
            Historial de Diagnósticos
          </Title>
          
          {equipment.diagnostics.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No hay diagnósticos registrados.
            </div>
          ) : (
            <div className="space-y-4">
              {equipment.diagnostics.map(diagnostic => (
                <div key={diagnostic.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <Text className="text-sm font-medium text-gray-600">
                      {diagnostic.user} - {format(new Date(diagnostic.date), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </Text>
                  </div>
                  <Text className="text-gray-700">{diagnostic.text}</Text>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* New Diagnostic Form */}
        <Card className="rounded-lg shadow">
          <Title level={4} className="text-xl font-semibold text-gray-800 mb-4">
            Registrar Nuevo Diagnóstico
          </Title>
          
          <Form
            form={diagnosticForm}
            layout="vertical"
            className="space-y-4"
            onFinish={handleAddDiagnostic}
          >
            <Form.Item
              label="Diagnóstico"
              name="text"
              rules={[{ required: true, message: 'Por favor ingrese el diagnóstico' }]}
            >
              <Input.TextArea rows={4} className="w-full" />
            </Form.Item>
            
            <Form.Item
              label="Nombre del Técnico"
              name="user"
              rules={[{ required: true, message: 'Por favor ingrese el nombre del técnico' }]}
            >
              <Input className="w-full" />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 w-full"
              >
                Guardar Diagnóstico
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      {/* PDF Modal */}
      <Modal
        title={`Reporte ${reportType === 'complete' ? 'Completo' : 'Resumido'}`}
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        width={800}
        footer={[
          <Button 
            key="download" 
            type="primary"
            className="orange-button"
            icon={<FilePdfOutlined />}
          >
            Descargar PDF
          </Button>,
          <Button 
            key="close" 
            onClick={() => setReportModalVisible(false)}
          >
            Cerrar
          </Button>,
        ]}
      >
        <div className="h-96 bg-gray-100 rounded flex items-center justify-center">
          <div className="text-center">
            <FilePdfOutlined className="text-4xl text-gray-400 mb-2" />
            <Text type="secondary">Vista previa del reporte PDF</Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EquipmentDetails;