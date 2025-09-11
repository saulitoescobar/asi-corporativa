import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Breadcrumb, Typography, Spin } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function LinesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLines();
  }, []);

  const fetchLines = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/lines');
      const lines = await response.json();
      setData(lines);
    } catch (error) {
      console.error('Error fetching lines:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID de la línea',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Número de línea',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
    },
    {
      title: 'Usuario',
      key: 'user',
      render: (_, record) => {
        if (record.user) {
          return `${record.user.firstName} ${record.user.lastName}`;
        }
        return 'No asignado';
      },
    },
    {
      title: 'Empresa',
      key: 'company',
      render: (_, record) => {
        if (record.user && record.user.company) {
          return record.user.company.name;
        }
        return 'No asignada';
      },
    },
    {
      title: 'Plan',
      key: 'plan',
      render: (_, record) => {
        if (record.plan) {
          return `${record.plan.planName} - $${record.plan.cost}`;
        }
        return 'Sin plan';
      },
    },
    {
      title: 'Telco',
      key: 'telco',
      render: (_, record) => {
        if (record.telco) {
          return record.telco.name;
        }
        return 'Sin telco';
      },
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'green';
        if (status === 'INACTIVE') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/lines/${record.id}`)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb style={{ marginBottom: 8 }}>
          <Breadcrumb.Item>Tablero</Breadcrumb.Item>
          <Breadcrumb.Item>Líneas</Breadcrumb.Item>
          <Breadcrumb.Item>Lista de líneas</Breadcrumb.Item>
        </Breadcrumb>
        <Typography.Title level={2}>Todas las líneas</Typography.Title>
      </div>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={false}
        />
      </Spin>
    </div>
  );
}