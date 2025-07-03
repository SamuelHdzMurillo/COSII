import React from 'react';
import { Table, Button, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

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

interface EquipamentsListProps {
  equipments: Equipment[];
}

const EquipamentsList: React.FC<EquipamentsListProps> = ({ equipments }) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Número de Serie',
      dataIndex: 'numeroDeSerieEquipo',
      key: 'numeroDeSerieEquipo',
    },
    {
      title: 'Marca',
      dataIndex: 'marcaEquipo',
      key: 'marcaEquipo',
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
      title: 'Estado',
      dataIndex: 'estadoEquipo',
      key: 'estadoEquipo',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Equipment) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dashboard/equipo/${record.id}`)}
          >
            Ver detalles
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={equipments}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default EquipamentsList; 