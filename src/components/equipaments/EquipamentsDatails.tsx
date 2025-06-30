// src/pages/EquipmentDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { 
  Card, 
  Button, 
  Typography, 
  Divider, 
  Form, 
  Input,
  Modal,
  Spin,
  DatePicker,
  Select,
  Space,
  message
} from 'antd';
import { 
  ArrowLeftOutlined, 
  FilePdfOutlined, 
  FileTextOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [diagnosticForm] = Form.useForm();
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportType, setReportType] = useState<'complete' | 'summary'>('complete');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>();
  const [filteredDiagnostics, setFilteredDiagnostics] = useState<Diagnostic[]>([]);

  useEffect(() => {
    if (id) {
      loadEquipment(id);
    }
  }, [id]);

  useEffect(() => {
    if (equipment) {
      applyFilters();
    }
  }, [equipment, dateRange]);

  const loadEquipment = (equipmentId: string) => {
    setLoading(true);
    setTimeout(() => {
      const storedEquipments = localStorage.getItem('equipments');
      if (storedEquipments) {
        const equipments: Equipment[] = JSON.parse(storedEquipments);
        const foundEquipment = equipments.find(eq => eq.id === equipmentId);
        if (foundEquipment) {
          setEquipment(foundEquipment);
          setFilteredDiagnostics(foundEquipment.diagnostics);
        }
      }
      setLoading(false);
    }, 500);
  };

  const applyFilters = () => {
    if (!equipment) return;

    let diagnostics = [...equipment.diagnostics];

    if (dateRange) {
      diagnostics = diagnostics.filter(d => {
        const date = dayjs(d.date);
        return date.isAfter(dateRange[0].startOf('day')) && 
               date.isBefore(dateRange[1].endOf('day'));
      });
    }

    setFilteredDiagnostics(diagnostics);
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
      message.success('Diagnóstico agregado correctamente');
    }
  };

  const handleGenerateReport = (type: 'complete' | 'summary') => {
    setReportType(type);
    setReportModalVisible(true);
  };

  const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
    setDateRange(dates || undefined);
  };

  const handleJsPdf = () => {
    if (!equipment) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte de Equipo Técnico', 10, 15);
    doc.setFontSize(12);
    doc.text(`Número de Inventario: ${equipment.inventoryNumber}`, 10, 30);
    doc.text(`Modelo/Serie: ${equipment.modelSerial}`, 10, 40);
    doc.text(`Fecha de Registro: ${equipment.registrationDate}`, 10, 50);
    doc.text(`Ubicación: ${equipment.locationId}`, 10, 60);
    doc.text('Diagnósticos:', 10, 75);
    equipment.diagnostics.slice(0, 3).forEach((diag, idx) => {
      doc.text(
        `${idx + 1}. ${diag.user} - ${diag.date}: ${diag.text}`,
        12,
        85 + idx * 10
      );
    });
    window.open(doc.output('bloburl'), '_blank');
  };

  // Nueva función para generar un PDF simple con Lorem Ipsum
  const handleSimplePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte de Prueba', 10, 15);
    doc.setFontSize(12);
    doc.text('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut laoreet dictum, massa sapien pretium libero, nec cursus enim erat nec urna. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nisl.', 10, 30, { maxWidth: 180 });
    window.open(doc.output('bloburl'), '_blank');
  };

  if (!equipment) {
    return <Spin tip="Cargando equipo..." fullscreen />;
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
            onClick={handleSimplePdf}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Generar Reporte PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostic History */}
        <Card className="rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <Title level={4} className="text-xl font-semibold text-gray-800">
              Historial de Diagnósticos
            </Title>
            <Space>
              <RangePicker
                onChange={(dates: any, dateStrings: [string, string]) => handleDateRangeChange(dates as [Dayjs, Dayjs] | null)}
                format="DD/MM/YYYY"
                placeholder={['Fecha inicio', 'Fecha fin']}
              />
              <Text type="secondary">
                Mostrando {filteredDiagnostics.length} de {equipment.diagnostics.length}
              </Text>
            </Space>
          </div>
          
          {filteredDiagnostics.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No hay diagnósticos registrados para el filtro seleccionado.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDiagnostics.map(diagnostic => (
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
                loading={loading}
              >
                Guardar Diagnóstico
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default EquipmentDetails;