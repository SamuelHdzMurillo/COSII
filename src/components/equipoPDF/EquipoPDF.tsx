// src/components/equipoPDF/EquipoPDF.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import '@ant-design/v5-patch-for-react-19';
import { Button } from 'antd';
import jsPDF from 'jspdf';
// Registrar fuentes (opcional)
// Font.register({
//   family: 'Helvetica',
//   fonts: [
//     { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf' }, // normal
//     { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc9.ttf', fontWeight: 'bold' }, // bold
//   ]
// });

interface Diagnostic {
  id: string;
  text: string;
  user: string;
  date: string;
}

interface Equipment {
  id: string;
  inventoryNumber: string;
  modelSerial: string;
  registrationDate: string;
  locationId: string;
  diagnostics: Diagnostic[];
  imageUrl?: string;
}

const styles = StyleSheet.create({
  page: { 
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.5
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1 solid #e0e0e0',
    textAlign: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
    marginTop: 15
  },
  label: {
    fontWeight: 'bold',
    width: '30%'
  },
  value: {
    width: '70%'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5
  },
  diagnosticHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  diagnostic: {
    marginBottom: 15,
    padding: 10,
    border: '1 solid #f0f0f0',
    borderRadius: 4,
    backgroundColor: '#fafafa'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#999'
  },
  logo: {
    width: 100,
    marginBottom: 10,
    alignSelf: 'center'
  }
});

const EquipoPDF: React.FC<{ equipment: Equipment; type: 'complete' | 'summary' }> = ({ equipment, type }) => {
  // Puedes cargar un logo desde tus assets
  const logo = 'https://via.placeholder.com/100x50?text=LOGO';

  // Validación de datos
  if (!equipment || !equipment.inventoryNumber || !equipment.modelSerial || !equipment.registrationDate || !equipment.locationId || !Array.isArray(equipment.diagnostics)) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={{ color: 'red' }}>Error: Datos del equipo incompletos o inválidos.</Text>
        </Page>
      </Document>
    );
  }

  let registrationDate;
  try {
    registrationDate = new Date(equipment.registrationDate);
    if (isNaN(registrationDate.getTime())) throw new Error('Invalid date');
  } catch {
    registrationDate = null;
  }

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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado con logo */}
        <View style={styles.header}>
          {/* {logo && <Image src={logo} style={styles.logo} />} */}
          <Text style={styles.title}>Reporte de Equipo Técnico</Text>
          <Text style={{fontSize: 10}}>Generado el: {format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", {locale: es})}</Text>
        </View>

        {/* Información del equipo */}
        <View style={{marginBottom: 20}}>
          <Text style={styles.subtitle}>Datos del Equipo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Número de Inventario:</Text>
            <Text style={styles.value}>{equipment.inventoryNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Modelo/Serie:</Text>
            <Text style={styles.value}>{equipment.modelSerial}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Registro:</Text>
            <Text style={styles.value}>
              {registrationDate ? format(registrationDate, "dd 'de' MMMM 'de' yyyy", {locale: es}) : 'Fecha inválida'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ubicación:</Text>
            <Text style={styles.value}>{equipment.locationId}</Text>
          </View>
        </View>

        {/* Diagnósticos */}
        {type === 'complete' && (
          <View>
            <Text style={styles.subtitle}>
              Historial de Diagnósticos ({equipment.diagnostics.length})
            </Text>
            {equipment.diagnostics.map((d) => (
              <View key={d.id} style={styles.diagnostic}>
                <View style={styles.diagnosticHeader}>
                  <Text style={{fontWeight: 'bold'}}>{d.user}</Text>
                  <Text>
                    {format(new Date(d.date), "dd/MM/yyyy 'a las' HH:mm", {locale: es})}
                  </Text>
                </View>
                <Text>{d.text}</Text>
              </View>
            ))}
            {equipment.diagnostics.length === 0 && (
              <Text style={{fontStyle: 'italic'}}>No hay diagnósticos registrados para este equipo.</Text>
            )}
          </View>
        )}

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text>Sistema de Gestión de Equipos Técnicos - © {new Date().getFullYear()}</Text>
        </View>
      </Page>
      <Button onClick={handleJsPdf} type="primary">
        Generar PDF (jsPDF)
      </Button>
    </Document>
  );
};

// Función para generar el PDF desde fuera del componente
export const generateEquipoPdf = async (equipo: any) => {
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

export default EquipoPDF;