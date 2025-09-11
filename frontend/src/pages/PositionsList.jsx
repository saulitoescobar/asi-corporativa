import React, { useState, useEffect } from 'react';
import { Table, Typography, Spin, Alert } from 'antd';

const { Title } = Typography;

const PositionsList = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/positions');
      if (!response.ok) {
        throw new Error('Error al cargar posiciones');
      }
      const data = await response.json();
      setPositions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Nombre del Puesto',
      dataIndex: 'name',
      key: 'name',
    },
  ];

  if (loading) return <Spin size="large" />;
  if (error) return <Alert message="Error" description={error} type="error" />;

  return (
    <div>
      <Title level={2}>Posiciones</Title>
      <Table 
        columns={columns} 
        dataSource={positions} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default PositionsList;