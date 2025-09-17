import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Spin, Alert, Button, Modal, Form, Input, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

const CompaniesList = () => {
  const navigate = useNavigate();
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
      title: 'Representantes Legales',
      key: 'legalRepresentatives',
      width: 250,
      render: (_, record) => {
        if (record.legalRepresentatives && record.legalRepresentatives.length > 0) {
          return (
            <div>
              {record.legalRepresentatives.map((rep, index) => (
                <div key={rep.id} style={{ 
                  marginBottom: index < record.legalRepresentatives.length - 1 ? '6px' : '0',
                  padding: '4px 0',
                  borderBottom: index < record.legalRepresentatives.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>
                    {rep.firstName} {rep.lastName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {rep.profession}
                  </div>
                </div>
              ))}
              {record.legalRepresentatives.length > 1 && (
                <div style={{ 
                  fontSize: '11px', 
                  color: '#1890ff', 
                  marginTop: '4px',
                  fontWeight: 500
                }}>
                  {record.legalRepresentatives.length} representantes activos
                </div>
              )}
            </div>
          );
        }
        return <span style={{ color: '#999', fontStyle: 'italic' }}>Sin representantes activos</span>;
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/companies/${record.id}`)}
            title="Ver detalle"
          />
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