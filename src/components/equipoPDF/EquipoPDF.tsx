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

export default EquipoPDF;