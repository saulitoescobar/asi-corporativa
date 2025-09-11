import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const LegalRepresentativesList = () => {
  const [representatives, setRepresentatives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRepresentative, setEditingRepresentative] = useState(null);
  const [form] = Form.useForm();

  // Cargar representantes legales
  const fetchRepresentatives = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/legal-representatives');
      if (response.ok) {
        const data = await response.json();
        setRepresentatives(data);
      } else {
        message.error('Error al cargar los representantes legales');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Cargar empresas para el selector
  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error al cargar empresas:', error);
    }
  };

  useEffect(() => {
    fetchRepresentatives();
    fetchCompanies();
  }, []);

  // Calcular edad
  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    return dayjs().diff(dayjs(birthDate), 'years');
  };

  // Manejar envío del formulario
  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
      };

      const url = editingRepresentative
        ? `http://localhost:3001/api/legal-representatives/${editingRepresentative.id}`
        : 'http://localhost:3001/api/legal-representatives';

      const method = editingRepresentative ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedValues),
      });

      if (response.ok) {
        message.success(
          editingRepresentative
            ? 'Representante legal actualizado exitosamente'
            : 'Representante legal creado exitosamente'
        );
        setModalVisible(false);
        setEditingRepresentative(null);
        form.resetFields();
        fetchRepresentatives();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Error de conexión');
    }
  };

  // Manejar edición
  const handleEdit = (record) => {
    setEditingRepresentative(record);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      cui: record.cui,
      birthDate: record.birthDate ? dayjs(record.birthDate) : null,
      profession: record.profession,
      companyId: record.companyId,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setModalVisible(true);
  };

  // Manejar eliminación
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/legal-representatives/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Representante legal eliminado exitosamente');
        fetchRepresentatives();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Error al eliminar el representante legal');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Error de conexión');
    }
  };

  // Manejar activar/desactivar
  const handleToggleActive = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/legal-representatives/${id}/toggle-active`, {
        method: 'PATCH',
      });

      if (response.ok) {
        message.success('Estado actualizado exitosamente');
        fetchRepresentatives();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Error de conexión');
    }
  };

  // Manejar apertura de modal para nuevo representante
  const handleAdd = () => {
    setEditingRepresentative(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Cerrar modal
  const handleCancel = () => {
    setModalVisible(false);
    setEditingRepresentative(null);
    form.resetFields();
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Nombre Completo',
      key: 'fullName',
      width: 200,
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'CUI',
      dataIndex: 'cui',
      key: 'cui',
      width: 140,
    },
    {
      title: 'Edad',
      key: 'age',
      width: 80,
      render: (_, record) => calculateAge(record.birthDate),
    },
    {
      title: 'Profesión',
      dataIndex: 'profession',
      key: 'profession',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Empresa',
      key: 'company',
      width: 180,
      render: (_, record) => record.company?.name || '-',
    },
    {
      title: 'Periodo',
      key: 'period',
      width: 200,
      render: (_, record) => {
        const start = record.startDate ? dayjs(record.startDate).format('DD/MM/YYYY') : '';
        const end = record.endDate ? dayjs(record.endDate).format('DD/MM/YYYY') : 'Actual';
        return `${start} - ${end}`;
      },
    },
    {
      title: 'Estado',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Button
            type={record.isActive ? 'default' : 'primary'}
            icon={<HistoryOutlined />}
            size="small"
            onClick={() => handleToggleActive(record.id)}
            title={record.isActive ? 'Desactivar' : 'Activar'}
          />
          <Popconfirm
            title="¿Estás seguro de eliminar este representante legal?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2 style={{ margin: 0 }}>
              <UserOutlined style={{ marginRight: 8 }} />
              Representantes Legales
            </h2>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Nuevo Representante Legal
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={representatives}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} representantes legales`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingRepresentative ? 'Editar Representante Legal' : 'Nuevo Representante Legal'}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Nombre"
                rules={[
                  { required: true, message: 'El nombre es obligatorio' },
                  { max: 50, message: 'El nombre no puede exceder 50 caracteres' }
                ]}
              >
                <Input placeholder="Ingrese el nombre" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Apellido"
                rules={[
                  { required: true, message: 'El apellido es obligatorio' },
                  { max: 50, message: 'El apellido no puede exceder 50 caracteres' }
                ]}
              >
                <Input placeholder="Ingrese el apellido" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cui"
                label="CUI"
                rules={[
                  { required: true, message: 'El CUI es obligatorio' },
                  { 
                    pattern: /^\d{13}$/, 
                    message: 'El CUI debe tener exactamente 13 dígitos' 
                  }
                ]}
              >
                <Input placeholder="Ingrese el CUI (13 dígitos)" maxLength={13} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="birthDate"
                label="Fecha de Nacimiento"
                rules={[
                  { required: true, message: 'La fecha de nacimiento es obligatoria' }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  placeholder="Seleccione la fecha"
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="profession"
            label="Profesión"
            rules={[
              { required: true, message: 'La profesión es obligatoria' },
              { max: 100, message: 'La profesión no puede exceder 100 caracteres' }
            ]}
          >
            <Input placeholder="Ingrese la profesión" />
          </Form.Item>

          <Form.Item
            name="companyId"
            label="Empresa"
            rules={[
              { required: true, message: 'La empresa es obligatoria' }
            ]}
          >
            <Select placeholder="Seleccione la empresa">
              {companies.map(company => (
                <Option key={company.id} value={company.id}>
                  {company.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Fecha de Inicio"
                rules={[
                  { required: true, message: 'La fecha de inicio es obligatoria' }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  placeholder="Fecha de inicio"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Fecha de Fin (opcional)"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  placeholder="Fecha de fin"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRepresentative ? 'Actualizar' : 'Crear'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LegalRepresentativesList;