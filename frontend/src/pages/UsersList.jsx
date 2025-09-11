import React, { useEffect, useState } from 'react';
import { Table, Typography, Spin } from 'antd';

export default function UsersList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/users');
      const users = await response.json();
      setData(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'CUI', dataIndex: 'cui', key: 'cui' },
    { 
      title: 'Nombre completo', 
      key: 'fullName',
      render: (_, record) => `${record.firstName} ${record.lastName}`
    },
    { 
      title: 'Empresa', 
      key: 'company',
      render: (_, record) => record.company ? record.company.name : 'Sin empresa'
    },
    { 
      title: 'Puesto', 
      key: 'position',
      render: (_, record) => record.position ? record.position.name : 'Sin puesto'
    },
    { title: 'Fecha de ingreso', dataIndex: 'joinDate', key: 'joinDate' },
  ];

  return (
    <div>
      <Typography.Title level={2}>Usuarios</Typography.Title>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={false} />
      </Spin>
    </div>
  );
}