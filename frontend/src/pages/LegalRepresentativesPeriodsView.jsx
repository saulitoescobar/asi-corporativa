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
  Card,
  Descriptions,
  Tabs,
  Timeline,
  Tooltip,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  HistoryOutlined,
  ClearOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  BankOutlined,
  StopOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const LegalRepresentativesList = () => {
  const [representatives, setRepresentatives] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para modales
  const [repModalVisible, setRepModalVisible] = useState(false);
  const [periodModalVisible, setPeriodModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  
  // Estados para edición
  const [editingRepresentative, setEditingRepresentative] = useState(null);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [viewingRepresentative, setViewingRepresentative] = useState(null);
  
  // Formularios
  const [repForm] = Form.useForm();
  const [periodForm] = Form.useForm();
  
  // Estados para filtros y búsqueda
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [activeTab, setActiveTab] = useState('representatives');
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
    pageSizeOptions: ['5', '10', '20', '50'],
  });

  // Atajos de teclado
  useKeyboardShortcuts([
    {
      key: 'F2',
      callback: () => handleCreateRepresentative(),
      description: 'Crear nuevo representante legal'
    },
    {
      key: 'F3',
      callback: () => handleCreatePeriod(),
      description: 'Crear nuevo período'
    }
  ]);

  // Cargar datos
  useEffect(() => {
    fetchRepresentatives();
    fetchPeriods();
    fetchCompanies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchText, representatives, periods, activeTab]);

  const fetchRepresentatives = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/legal-representatives');
      if (!response.ok) throw new Error('Error al cargar representantes legales');
      const data = await response.json();
      setRepresentatives(data);
    } catch (error) {
      message.error('Error al cargar representantes legales: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriods = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/legal-rep-periods/periods');
      if (!response.ok) throw new Error('Error al cargar períodos');
      const data = await response.json();
      setPeriods(data);
    } catch (error) {
      message.error('Error al cargar períodos: ' + error.message);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/companies');
      if (!response.ok) throw new Error('Error al cargar empresas');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      message.error('Error al cargar empresas: ' + error.message);
    }
  };

  // Filtros y búsqueda
  const applyFilters = () => {
    let filtered = activeTab === 'representatives' ? representatives : periods;
    const filters = [];

    if (searchText) {
      filtered = filtered.filter(item => {
        if (activeTab === 'representatives') {
          return (
            item.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.cui?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.profession?.toLowerCase().includes(searchText.toLowerCase())
          );
        } else {
          return (
            item.legalRepresentative?.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.legalRepresentative?.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.company?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchText.toLowerCase())
          );
        }
      });
      filters.push('search');
    }

    setFilteredData(filtered);
    setAppliedFilters(filters);
    setPagination(prev => ({ ...prev, current: 1, total: filtered.length }));
  };

  const onSearch = (value) => {
    setSearchText(value);
  };

  const clearAllFilters = () => {
    setSearchText('');
    setAppliedFilters([]);
  };

  // CRUD Representantes Legales
  const handleCreateRepresentative = () => {
    setEditingRepresentative(null);
    repForm.resetFields();
    setRepModalVisible(true);
  };

  const handleEditRepresentative = (representative) => {
    setEditingRepresentative(representative);
    repForm.setFieldsValue({
      ...representative,
      birthDate: representative.birthDate ? dayjs(representative.birthDate) : null,
    });
    setRepModalVisible(true);
  };

  const handleSubmitRepresentative = async (values) => {
    try {
      const url = editingRepresentative 
        ? `http://localhost:3001/api/legal-representatives/${editingRepresentative.id}`
        : 'http://localhost:3001/api/legal-representatives';
      
      const method = editingRepresentative ? 'PUT' : 'POST';

      const submitData = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar representante legal');
      }

      message.success(editingRepresentative ? 'Representante legal actualizado' : 'Representante legal creado');
      setRepModalVisible(false);
      fetchRepresentatives();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleDeleteRepresentative = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/legal-representatives/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar representante legal');
      }

      message.success('Representante legal eliminado');
      fetchRepresentatives();
    } catch (error) {
      message.error(error.message);
    }
  };

  // CRUD Períodos
  const handleCreatePeriod = () => {
    setEditingPeriod(null);
    periodForm.resetFields();
    // Establecer fecha de inicio por defecto a hoy
    periodForm.setFieldsValue({ 
      startDate: dayjs(),
    });
    setPeriodModalVisible(true);
  };

  const handleEditPeriod = (period) => {
    setEditingPeriod(period);
    periodForm.setFieldsValue({
      ...period,
      startDate: period.startDate ? dayjs(period.startDate) : null,
      endDate: period.endDate ? dayjs(period.endDate) : null,
    });
    setPeriodModalVisible(true);
  };

  const handleSubmitPeriod = async (values) => {
    try {
      const url = editingPeriod 
        ? `http://localhost:3001/api/legal-rep-periods/periods/${editingPeriod.id}`
        : 'http://localhost:3001/api/legal-rep-periods/periods';
      
      const method = editingPeriod ? 'PUT' : 'POST';

      const submitData = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        isActive: !values.endDate, // Si no hay fecha de fin, está activo
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar período');
      }

      message.success(editingPeriod ? 'Período actualizado' : 'Período creado');
      setPeriodModalVisible(false);
      fetchPeriods();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleEndPeriod = async (period) => {
    try {
      const response = await fetch(`http://localhost:3001/api/legal-rep-periods/periods/${period.id}/end`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          endDate: dayjs().format('YYYY-MM-DD'),
          notes: `Período finalizado el ${dayjs().format('DD/MM/YYYY')}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al finalizar período');
      }

      message.success('Período finalizado exitosamente');
      fetchPeriods();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleDeletePeriod = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/legal-rep-periods/periods/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar período');
      }

      message.success('Período eliminado');
      fetchPeriods();
    } catch (error) {
      message.error(error.message);
    }
  };

  // Vista detallada
  const handleView = (representative) => {
    setViewingRepresentative(representative);
    setViewModalVisible(true);
  };

  // Columnas para representantes legales
  const representativeColumns = [
    {
      title: 'Nombre',
      key: 'name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.firstName} {record.lastName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            CUI: {record.cui}
          </div>
        </div>
      ),
    },
    {
      title: 'Profesión',
      dataIndex: 'profession',
      key: 'profession',
      render: (profession) => profession || 'No especificada',
    },
    {
      title: 'Empresas Actuales',
      key: 'currentCompanies',
      render: (_, record) => {
        const activePeriods = record.companyPeriods?.filter(p => p.isActive) || [];
        return (
          <div>
            {activePeriods.length > 0 ? (
              activePeriods.map(period => (
                <Tag key={period.id} color="green" style={{ marginBottom: '2px' }}>
                  {period.company?.name}
                </Tag>
              ))
            ) : (
              <Text type="secondary">Sin empresas activas</Text>
            )}
          </div>
        );
      },
    },
    {
      title: 'Total Períodos',
      key: 'totalPeriods',
      render: (_, record) => {
        const totalPeriods = record.companyPeriods?.length || 0;
        const activePeriods = record.companyPeriods?.filter(p => p.isActive).length || 0;
        return (
          <div style={{ textAlign: 'center' }}>
            <Badge count={activePeriods} style={{ backgroundColor: '#52c41a' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{totalPeriods}</span>
            </Badge>
          </div>
        );
      },
    },
    {
      title: 'Contacto',
      key: 'contact',
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          {record.email && <div>📧 {record.email}</div>}
          {record.phone && <div>📱 {record.phone}</div>}
        </div>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
            title="Ver detalle"
          />
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEditRepresentative(record)}
            title="Editar"
          />
          <Popconfirm
            title="¿Estás seguro de eliminar este representante legal?"
            onConfirm={() => handleDeleteRepresentative(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              title="Eliminar"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Columnas para períodos
  const periodColumns = [
    {
      title: 'Representante Legal',
      key: 'representative',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.legalRepresentative?.firstName} {record.legalRepresentative?.lastName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            CUI: {record.legalRepresentative?.cui}
          </div>
        </div>
      ),
    },
    {
      title: 'Empresa',
      key: 'company',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.company?.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            NIT: {record.company?.nit}
          </div>
        </div>
      ),
    },
    {
      title: 'Período',
      key: 'period',
      render: (_, record) => (
        <div>
          <div>
            📅 Inicio: {dayjs(record.startDate).format('DD/MM/YYYY')}
          </div>
          {record.endDate && (
            <div>
              🏁 Fin: {dayjs(record.endDate).format('DD/MM/YYYY')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'red'} icon={record.isActive ? <PlayCircleOutlined /> : <StopOutlined />}>
          {record.isActive ? 'ACTIVO' : 'FINALIZADO'}
        </Tag>
      ),
    },
    {
      title: 'Duración',
      key: 'duration',
      render: (_, record) => {
        const start = dayjs(record.startDate);
        const end = record.endDate ? dayjs(record.endDate) : dayjs();
        const duration = end.diff(start, 'days');
        return `${duration} días`;
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEditPeriod(record)}
            title="Editar período"
          />
          {record.isActive && (
            <Popconfirm
              title="¿Finalizar este período?"
              onConfirm={() => handleEndPeriod(record)}
              okText="Sí"
              cancelText="No"
            >
              <Button 
                type="link" 
                icon={<StopOutlined />}
                title="Finalizar período"
              />
            </Popconfirm>
          )}
          <Popconfirm
            title="¿Eliminar este período?"
            onConfirm={() => handleDeletePeriod(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              title="Eliminar"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <Breadcrumb.Item>Sistema</Breadcrumb.Item>
        <Breadcrumb.Item>Representantes Legales</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Representantes Legales & Períodos</Title>
        <Space>
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={handleCreateRepresentative}
            size="large"
            title="Presiona F2 para crear nuevo representante"
          >
            Nuevo Representante (F2)
          </Button>
          <Button
            type="primary"
            ghost
            icon={<ClockCircleOutlined />}
            onClick={handleCreatePeriod}
            size="large"
            title="Presiona F3 para crear nuevo período"
          >
            Nuevo Período (F3)
          </Button>
        </Space>
      </div>

      {/* Controles de filtros */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder={`Buscar ${activeTab === 'representatives' ? 'representantes' : 'períodos'}...`}
            allowClear
            value={searchText}
            onChange={(e) => onSearch(e.target.value)}
            onSearch={onSearch}
            style={{ width: '100%' }}
            size="large"
            enterButton="Buscar"
          />
        </Col>
        
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
        
        <Col xs={24} sm={12} md={12} style={{ textAlign: 'right' }}>
          <Text type="secondary" style={{ fontSize: '14px', lineHeight: '40px' }}>
            {filteredData.length > 0 ? (
              <>
                Mostrando{' '}
                <Text strong>
                  {(pagination.current - 1) * pagination.pageSize + 1}-
                  {Math.min(pagination.current * pagination.pageSize, filteredData.length)}
                </Text>{' '}
                de <Text strong>{filteredData.length}</Text> registros
                {appliedFilters.length > 0 && (
                  <>
                    {' '}(filtrado de {activeTab === 'representatives' ? representatives.length : periods.length} registros totales)
                  </>
                )}
              </>
            ) : null}
          </Text>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              Representantes Legales ({representatives.length})
            </span>
          } 
          key="representatives"
        >
          <Table
            columns={representativeColumns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, current: page, pageSize }));
              },
            }}
            scroll={{ x: 800 }}
          />
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <ClockCircleOutlined />
              Períodos de Representación ({periods.length})
            </span>
          } 
          key="periods"
        >
          <Table
            columns={periodColumns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, current: page, pageSize }));
              },
            }}
            scroll={{ x: 1000 }}
          />
        </TabPane>
      </Tabs>

      {/* Modal para crear/editar representante legal */}
      <Modal
        title={editingRepresentative ? 'Editar Representante Legal' : 'Nuevo Representante Legal'}
        visible={repModalVisible}
        onCancel={() => setRepModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={repForm}
          layout="vertical"
          onFinish={handleSubmitRepresentative}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombres"
                name="firstName"
                rules={[
                  { required: true, message: 'Por favor ingresa el nombre' },
                  { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
                ]}
              >
                <Input placeholder="Ej: Juan Carlos" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Apellidos"
                name="lastName"
                rules={[
                  { required: true, message: 'Por favor ingresa los apellidos' },
                  { min: 2, message: 'Los apellidos deben tener al menos 2 caracteres' }
                ]}
              >
                <Input placeholder="Ej: López García" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="CUI"
                name="cui"
                rules={[
                  { required: true, message: 'Por favor ingresa el CUI' },
                  { len: 13, message: 'El CUI debe tener exactamente 13 dígitos' },
                  { pattern: /^\d+$/, message: 'El CUI debe contener solo números' }
                ]}
              >
                <Input placeholder="1234567890123" maxLength={13} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Fecha de Nacimiento"
                name="birthDate"
                rules={[
                  { required: true, message: 'Por favor selecciona la fecha de nacimiento' }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Fecha de nacimiento"
                  disabledDate={(current) => current && current > dayjs().subtract(18, 'years')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Profesión"
                name="profession"
              >
                <Input placeholder="Ej: Abogado, Contador, etc." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: 'email', message: 'Ingresa un email válido' }
                ]}
              >
                <Input placeholder="ejemplo@email.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Teléfono"
                name="phone"
              >
                <Input placeholder="+502 1234-5678" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Dirección"
                name="address"
              >
                <Input.TextArea rows={2} placeholder="Dirección completa..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setRepModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRepresentative ? 'Actualizar' : 'Crear'} Representante
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para crear/editar período */}
      <Modal
        title={editingPeriod ? 'Editar Período' : 'Nuevo Período de Representación'}
        visible={periodModalVisible}
        onCancel={() => setPeriodModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={periodForm}
          layout="vertical"
          onFinish={handleSubmitPeriod}
        >
          <Form.Item
            label="Representante Legal"
            name="legalRepresentativeId"
            rules={[
              { required: true, message: 'Por favor selecciona un representante legal' }
            ]}
          >
            <Select
              placeholder="Selecciona un representante legal"
              showSearch
              optionFilterProp="children"
            >
              {representatives.map(rep => (
                <Option key={rep.id} value={rep.id}>
                  {rep.firstName} {rep.lastName} - {rep.cui}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Empresa"
            name="companyId"
            rules={[
              { required: true, message: 'Por favor selecciona una empresa' }
            ]}
          >
            <Select
              placeholder="Selecciona una empresa"
              showSearch
              optionFilterProp="children"
            >
              {companies.map(company => (
                <Option key={company.id} value={company.id}>
                  {company.name} - {company.nit}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Fecha de Inicio"
                name="startDate"
                rules={[
                  { required: true, message: 'Por favor selecciona la fecha de inicio' }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Fecha de inicio"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Fecha de Fin (Opcional)"
                name="endDate"
                tooltip="Dejar vacío si el período está activo"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Fecha de fin (opcional)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Notas"
            name="notes"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Notas adicionales sobre este período..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setPeriodModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {editingPeriod ? 'Actualizar' : 'Crear'} Período
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de vista detallada */}
      <Modal
        title="Detalle del Representante Legal"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {viewingRepresentative && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Descriptions title="Información Personal" column={2}>
                <Descriptions.Item label="Nombre Completo">
                  {viewingRepresentative.firstName} {viewingRepresentative.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="CUI">
                  {viewingRepresentative.cui}
                </Descriptions.Item>
                <Descriptions.Item label="Profesión">
                  {viewingRepresentative.profession || 'No especificada'}
                </Descriptions.Item>
                <Descriptions.Item label="Edad">
                  {viewingRepresentative.age || 'No disponible'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {viewingRepresentative.email || 'No proporcionado'}
                </Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                  {viewingRepresentative.phone || 'No proporcionado'}
                </Descriptions.Item>
                <Descriptions.Item label="Dirección" span={2}>
                  {viewingRepresentative.address || 'No proporcionada'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Historial de Empresas">
              <Timeline>
                {viewingRepresentative.companyPeriods?.map(period => (
                  <Timeline.Item
                    key={period.id}
                    color={period.isActive ? 'green' : 'blue'}
                    dot={period.isActive ? <PlayCircleOutlined /> : <ClockCircleOutlined />}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {period.company?.name}
                      </div>
                      <div style={{ color: '#666', marginBottom: '8px' }}>
                        {dayjs(period.startDate).format('DD/MM/YYYY')} - {period.endDate ? dayjs(period.endDate).format('DD/MM/YYYY') : 'Presente'}
                      </div>
                      {period.notes && (
                        <div style={{ fontSize: '14px', fontStyle: 'italic' }}>
                          {period.notes}
                        </div>
                      )}
                      <Tag color={period.isActive ? 'green' : 'default'} style={{ marginTop: '4px' }}>
                        {period.isActive ? 'ACTIVO' : 'FINALIZADO'}
                      </Tag>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
              {(!viewingRepresentative.companyPeriods || viewingRepresentative.companyPeriods.length === 0) && (
                <Text type="secondary">No hay períodos registrados para este representante.</Text>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LegalRepresentativesList;