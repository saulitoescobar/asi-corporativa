import React, { useState, useEffect } from 'react';
import { Table, Typography, Spin, Alert, Button, Modal, Form, Input, DatePicker, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/companies');
      if (!response.ok) {
        throw new Error('Error al cargar empresas');
      }
      const data = await response.json();
      setCompanies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCompany(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    form.setFieldsValue({
      ...company,
      legalRepresentationValidity: company.legalRepresentationValidity ? dayjs(company.legalRepresentationValidity) : null
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/companies/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar empresa');
      }
      
      message.success('Empresa eliminada exitosamente');
      fetchCompanies();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = {
        ...values,
        legalRepresentationValidity: values.legalRepresentationValidity ? 
          values.legalRepresentationValidity.format('YYYY-MM-DD') : null
      };

      const url = editingCompany 
        ? `http://localhost:3001/api/companies/${editingCompany.id}`
        : 'http://localhost:3001/api/companies';
      
      const method = editingCompany ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar empresa');
      }

      message.success(`Empresa ${editingCompany ? 'actualizada' : 'creada'} exitosamente`);
      setModalVisible(false);
      fetchCompanies();
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Empresa',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'NIT',
      dataIndex: 'nit',
      key: 'nit',
      width: 120,
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: 'Representante Legal',
      dataIndex: 'legalRepresentative',
      key: 'legalRepresentative',
      width: 180,
    },
    {
      title: 'Vigencia Rep. Legal',
      dataIndex: 'legalRepresentationValidity',
      key: 'legalRepresentationValidity',
      width: 140,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="¿Está seguro de eliminar esta empresa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) return <Spin size="large" />;
  if (error) return <Alert message="Error" description={error} type="error" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Empresas</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
        >
          Nueva Empresa
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={companies} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Nombre de la Empresa"
            rules={[{ required: true, message: 'El nombre es requerido' }]}
          >
            <Input placeholder="Ingrese el nombre de la empresa" />
          </Form.Item>

          <Form.Item
            name="nit"
            label="NIT"
            rules={[
              { max: 20, message: 'El NIT no puede exceder 20 caracteres' }
            ]}
          >
            <Input placeholder="Ingrese el NIT" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Dirección"
          >
            <TextArea 
              rows={3} 
              placeholder="Ingrese la dirección de la empresa" 
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Teléfono"
            rules={[
              { max: 20, message: 'El teléfono no puede exceder 20 caracteres' }
            ]}
          >
            <Input placeholder="Ingrese el teléfono" />
          </Form.Item>

          <Form.Item
            name="legalRepresentative"
            label="Representante Legal"
            rules={[
              { max: 100, message: 'El nombre no puede exceder 100 caracteres' }
            ]}
          >
            <Input placeholder="Ingrese el nombre del representante legal" />
          </Form.Item>

          <Form.Item
            name="legalRepresentationValidity"
            label="Vigencia de la Representación Legal"
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="Seleccione la fecha de vigencia"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCompany ? 'Actualizar' : 'Crear'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompaniesList;