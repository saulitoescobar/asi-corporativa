import React, { useState, useEffect } from 'react';
import { Table, Typography, Spin, Alert, Tag } from 'antd';

const { Title } = Typography;

const AdvisorsList = () => {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/advisors');
      if (!response.ok) {
        throw new Error('Error al cargar asesores');
      }
      const data = await response.json();
      setAdvisors(data);
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
      title: 'Nombre del Asesor',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={type === 'SALE' ? 'green' : 'blue'}>{type === 'SALE' ? 'Ventas' : 'Post-Venta'}</Tag>,
    },
  ];

  if (loading) return <Spin size="large" />;
  if (error) return <Alert message="Error" description={error} type="error" />;

  return (
    <div>
      <Title level={2}>Asesores</Title>
      <Table 
        columns={columns} 
        dataSource={advisors} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AdvisorsList;