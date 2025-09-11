import React, { useEffect, useState } from 'react';
import { Table, Typography, Spin } from 'antd';

export default function TelcosList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTelcos();
  }, []);

  const fetchTelcos = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/telcos');
      const telcos = await response.json();
      setData(telcos);
    } catch (error) {
      console.error('Error fetching telcos:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Dirección', dataIndex: 'address', key: 'address' },
    { title: 'Teléfono', dataIndex: 'phone', key: 'phone' },
    { 
      title: 'Asesor de Ventas', 
      key: 'salesAdvisor',
      render: (_, record) => record.salesAdvisor ? record.salesAdvisor.name : 'Sin asignar'
    },
    { 
      title: 'Asesor Post Ventas', 
      key: 'postSalesAdvisor',
      render: (_, record) => record.postSalesAdvisor ? record.postSalesAdvisor.name : 'Sin asignar'
    },
  ];

  return (
    <div>
      <Typography.Title level={2}>Telcos</Typography.Title>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={false} />
      </Spin>
    </div>
  );
}