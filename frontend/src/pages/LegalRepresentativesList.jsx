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
  Row,
  Col,
  Typography,
  Breadcrumb,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  HistoryOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;

const LegalRepresentativesList = () => {
  const [representatives, setRepresentatives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRepresentative, setEditingRepresentative] = useState(null);
  const [form] = Form.useForm();
  
  // Estados para filtros y búsqueda
  const [searchText, setSearchText] = useState('');
  const [filteredRepresentatives, setFilteredRepresentatives] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
    pageSizeOptions: ['5', '10', '20', '50'],
  });

  // Manejar apertura de modal para nuevo representante
  const handleAdd = () => {
    setEditingRepresentative(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Hook para atajos de teclado
  useKeyboardShortcuts([
    { key: 'F2', callback: handleAdd }
  ]);

  // Cargar representantes legales
  const fetchRepresentatives = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/legal-representatives');
      if (response.ok) {
        const data = await response.json();
        
        // Transformar datos para compatibilidad con estructura anterior
        const transformedData = data.flatMap(rep => {
          if (rep.companyPeriods && rep.companyPeriods.length > 0) {
            // Crear un registro por cada período de empresa
            return rep.companyPeriods.map(period => ({
              id: `${rep.id}-${period.id}`, // ID único para cada período
              originalId: rep.id, // ID original del representante
              periodId: period.id,
              firstName: rep.firstName,
              lastName: rep.lastName,
              cui: rep.cui,
              birthDate: rep.birthDate,
              profession: rep.profession,
              email: rep.email,
              phone: rep.phone,
              address: rep.address,
              company: period.company,
              companyId: period.companyId,
              startDate: period.startDate,
              endDate: period.endDate,
              isActive: period.isActive,
              notes: period.notes
            }));
          } else {
            // Representante sin períodos de empresa
            return [{
              id: rep.id,
              originalId: rep.id,
              periodId: null,
              firstName: rep.firstName,
              lastName: rep.lastName,
              cui: rep.cui,
              birthDate: rep.birthDate,
              profession: rep.profession,
              email: rep.email,
              phone: rep.phone,
              address: rep.address,
              company: null,
              companyId: null,
              startDate: null,
              endDate: null,
              isActive: false,
              notes: null
            }];
          }
        });
        
        setRepresentatives(transformedData);
        setFilteredRepresentatives(transformedData);
        setPagination(prev => ({
          ...prev,
          total: transformedData.length
        }));
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

  // Filtros y búsqueda
  const filterRepresentatives = () => {
    let filtered = [...representatives];
    
    if (searchText && typeof searchText === 'string' && searchText.trim() !== '') {
      const searchLower = (searchText || '').toString().toLowerCase();
      filtered = filtered.filter(rep => {
        if (!rep) return false;
        
        const firstName = (rep.firstName || '').toString().toLowerCase();
        const lastName = (rep.lastName || '').toString().toLowerCase();
        const email = (rep.email || '').toString().toLowerCase();
        const profession = (rep.profession || '').toString().toLowerCase();
        const companyName = (rep.company?.name || '').toString().toLowerCase();
        
        return firstName.includes(searchLower) ||
               lastName.includes(searchLower) ||
               email.includes(searchLower) ||
               profession.includes(searchLower) ||
               companyName.includes(searchLower);
      });
    }
    
    setFilteredRepresentatives(filtered);
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      current: 1
    }));
  };

  const clearAllFilters = () => {
    setSearchText('');
    setAppliedFilters([]);
  };

  const clearFilter = (filterToRemove) => {
    if (filterToRemove === 'search') {
      setSearchText('');
    }
    setAppliedFilters(prev => prev.filter(f => f !== filterToRemove));
  };

  const onSearch = (value) => {
    // Validar y sanitizar el valor de entrada
    const sanitizedValue = value && typeof value === 'string' ? value : (value ? String(value) : '');
    setSearchText(sanitizedValue);
    if (sanitizedValue && !appliedFilters.includes('search')) {
      setAppliedFilters(prev => [...prev, 'search']);
    } else if (!sanitizedValue) {
      setAppliedFilters(prev => prev.filter(f => f !== 'search'));
    }
  };

  useEffect(() => {
    if (Array.isArray(representatives) && searchText !== undefined) {
      filterRepresentatives();
    }
  }, [representatives, searchText]);

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
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item>Gestión de Representantes Legales</Breadcrumb.Item>
        <Breadcrumb.Item>Lista de representantes legales</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header con título y botón nuevo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <UserOutlined style={{ marginRight: 8 }} />
          Gestión de Representantes Legales
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
          title="Presiona F2 para crear nuevo representante legal"
        >
          Nuevo Representante Legal (F2)
        </Button>
      </div>

      {/* Controles de DataTable */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Búsqueda global */}
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Buscar representantes..."
            allowClear
            value={searchText}
            onChange={(e) => onSearch(e.target.value)}
            onSearch={onSearch}
            style={{ width: '100%' }}
            size="large"
            enterButton="Buscar"
          />
        </Col>
        
        {/* Selector de registros por página */}
        <Col xs={24} sm={12} md={4}>
          <Select
            style={{ width: '100%' }}
            value={pagination.pageSize}
            onChange={(value) => {
              setPagination(prev => ({ ...prev, pageSize: value, current: 1 }));
            }}
            size="large"
          >
            <Option value={5}>5 por página</Option>
            <Option value={10}>10 por página</Option>
            <Option value={25}>25 por página</Option>
            <Option value={50}>50 por página</Option>
            <Option value={100}>100 por página</Option>
          </Select>
        </Col>
        
        {/* Botón limpiar filtros */}
        <Col xs={24} sm={12} md={4}>
          <Button 
            icon={<ClearOutlined />} 
            onClick={clearAllFilters}
            disabled={appliedFilters.length === 0}
            size="large"
            style={{ width: '100%' }}
          >
            Limpiar Filtros
          </Button>
        </Col>
        
        {/* Información de registros */}
        <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
          <Text type="secondary" style={{ fontSize: '14px', lineHeight: '40px' }}>
            {filteredRepresentatives.length > 0 ? (
              <>
                Mostrando{' '}
                <Text strong>
                  {(pagination.current - 1) * pagination.pageSize + 1}-
                  {Math.min(pagination.current * pagination.pageSize, filteredRepresentatives.length)}
                </Text>{' '}
                de <Text strong>{filteredRepresentatives.length}</Text> registros
                {appliedFilters.length > 0 && (
                  <>
                    {' '}(filtrado de {representatives.length} registros totales)
                  </>
                )}
              </>
            ) : null}
          </Text>
        </Col>
      </Row>

      {/* Tags de filtros activos */}
      {appliedFilters.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text style={{ marginRight: 8 }}>Filtros activos:</Text>
          {appliedFilters.includes('search') && searchText && (
            <Tag 
              closable 
              onClose={() => clearFilter('search')}
              color="blue"
            >
              Búsqueda: {searchText}
            </Tag>
          )}
        </div>
      )}

      <Table
        columns={columns}
        dataSource={filteredRepresentatives}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        scroll={{ x: 1200 }}
        onChange={(paginationInfo) => {
          setPagination(paginationInfo);
        }}
      />

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