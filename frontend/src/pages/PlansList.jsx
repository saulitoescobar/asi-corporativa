import React, { useState, useEffect } from 'react';
import { Table, Typography, Spin, Alert, Tag } from 'antd';

const { Title } = Typography;

const PlansList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/plans');
      if (!response.ok) {
        throw new Error('Error al cargar planes');
      }
      const data = await response.json();
      setPlans(data);
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
      title: 'Nombre del Plan',
      dataIndex: 'planName',
      key: 'planName',
    },
    {
      title: 'Costo Mensual',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => `$${cost}`,
    },
    {
      title: 'Datos (MB)',
      dataIndex: 'megabytes',
      key: 'megabytes',
      render: (data) => <Tag color="blue">{data} MB</Tag>,
    },
    {
      title: 'Minutos',
      dataIndex: 'minutes',
      key: 'minutes',
      render: (minutes) => <Tag color="green">{minutes} min</Tag>,
    },
  ];

  if (loading) return <Spin size="large" />;
  if (error) return <Alert message="Error" description={error} type="error" />;

  return (
    <div>
      <Title level={2}>Planes</Title>
      <Table 
        columns={columns} 
        dataSource={plans} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default PlansList;