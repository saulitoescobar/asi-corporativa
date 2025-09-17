import React, { useEffect, useState, useRef } from 'react';
import {
  Table,
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  Row,
  Col,
  Tag,
  Select,
  message,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

function PlansList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form] = Form.useForm();
  const firstInputRef = useRef(null);
  const [partialResults, setPartialResults] = useState([]);
  
  // Estados para paginación y búsqueda tipo DataTables
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `Mostrando ${range[0]}-${range[1]} de ${total} registros`,
    pageSizeOptions: ['5', '10', '25', '50', '100'],
  });
  
  // Estados para filtros avanzados tipo DataTables
  const [filters, setFilters] = useState({
    global: '',
    planName: '',
    cost: '',
    megabytes: '',
    minutes: '',
    additionalServices: '',
  });
  
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  // Efecto para hacer focus en el primer campo cuando se abre el modal
  useEffect(() => {
    if (modalVisible && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current.focus();
      }, 100);
    }
  }, [modalVisible]);

  const fetchPlans = async (page = 1, pageSize = 10, currentFilters = filters) => {
    setLoading(true);
    try {
      // Construir query string con todos los filtros
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });

      // Agregar filtros si existen
      if (currentFilters.global) {
        queryParams.append('search', currentFilters.global);
      }
      if (currentFilters.planName) {
        queryParams.append('planName', currentFilters.planName);
      }
      if (currentFilters.cost) {
        queryParams.append('cost', currentFilters.cost);
      }
      if (currentFilters.megabytes) {
        queryParams.append('megabytes', currentFilters.megabytes);
      }
      if (currentFilters.minutes) {
        queryParams.append('minutes', currentFilters.minutes);
      }
      if (currentFilters.additionalServices) {
        queryParams.append('additionalServices', currentFilters.additionalServices);
      }

      const url = `http://localhost:3001/api/plans?${queryParams.toString()}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al obtener planes');
      }
      
      const result = await response.json();
      
      // Si la respuesta es un array simple (sin paginación), adaptarla
      if (Array.isArray(result)) {
        setData(result);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: result.length,
          pageSize: pageSize,
        }));
      } else {
        setData(result.plans || result.data || result);
        setPagination(prev => ({
          ...prev,
          current: result.pagination?.current || page,
          total: result.pagination?.total || result.total || (result.plans?.length || result.data?.length || result.length || 0),
          pageSize: pageSize,
        }));
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      message.error('Error al cargar los planes');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationInfo) => {
    fetchPlans(paginationInfo.current, paginationInfo.pageSize, filters);
  };

  // Búsqueda global tipo DataTables con debounce
  const debounceRef = useRef();
  const handleGlobalSearch = (value) => {
    // Filtrado parcial local
    setFilters(prev => ({ ...prev, global: value }));
    if (value.length > 0) {
      const filtered = data.filter(plan => {
        return Object.values(plan).some(v =>
          String(v).toLowerCase().includes(value.toLowerCase())
        );
      });
      setPartialResults(filtered);
    } else {
      setPartialResults([]);
    }
    // Debounce para consulta final a la API
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      const newFilters = { ...filters, global: value };
      setFilters(newFilters);
      setPagination(prev => ({ ...prev, current: 1 }));
      fetchPlans(1, pagination.pageSize, newFilters);
      updateActiveFilters(newFilters);
      setPartialResults([]);
    }, 1000); // 1s debounce para consulta final
  };

  // Filtros por columna tipo DataTables
  const handleColumnFilter = (column, value) => {
    const newFilters = { ...filters, [column]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchPlans(1, pagination.pageSize, newFilters);
    updateActiveFilters(newFilters);
  };

  // Actualizar tags de filtros activos
  const updateActiveFilters = (currentFilters) => {
    const active = [];
    if (currentFilters.global) {
      active.push({ key: 'global', label: 'Búsqueda Global', value: currentFilters.global });
    }
    if (currentFilters.planName) {
      active.push({ key: 'planName', label: 'Nombre del Plan', value: currentFilters.planName });
    }
    if (currentFilters.cost) {
      active.push({ key: 'cost', label: 'Costo', value: currentFilters.cost });
    }
    if (currentFilters.megabytes) {
      active.push({ key: 'megabytes', label: 'Datos (MB)', value: currentFilters.megabytes });
    }
    if (currentFilters.minutes) {
      active.push({ key: 'minutes', label: 'Minutos', value: currentFilters.minutes });
    }
    setActiveFilters(active);
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    const clearedFilters = {
      global: '',
      planName: '',
      cost: '',
      megabytes: '',
      minutes: '',
    };
    setFilters(clearedFilters);
    setActiveFilters([]);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchPlans(1, pagination.pageSize, clearedFilters);
  };

  // Limpiar filtro específico
  const clearFilter = (filterKey) => {
    const newFilters = { ...filters, [filterKey]: '' };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchPlans(1, pagination.pageSize, newFilters);
    updateActiveFilters(newFilters);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Atajos de teclado
  useKeyboardShortcuts([
    {
      key: 'F2',
      callback: handleCreate,
    },
  ]);

  const handleEdit = (record) => {
    setEditingPlan(record);
    form.setFieldsValue({
      planName: record.planName,
      cost: record.cost,
      megabytes: (record.megabytes / 1024).toFixed(1), // Convertir MB a GB
      minutes: record.minutes,
      additionalServices: record.additionalServices,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/plans/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar plan');
      }
      
      message.success('Plan eliminado exitosamente');
      fetchPlans(pagination.current, pagination.pageSize, filters);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingPlan 
        ? `http://localhost:3001/api/plans/${editingPlan.id}`
        : 'http://localhost:3001/api/plans';
      
      const method = editingPlan ? 'PUT' : 'POST';
      
      // Preparar los datos, convirtiendo GB a MB para el backend
      const submitData = {
        ...values,
        megabytes: parseFloat(values.megabytes) // El backend manejará la conversión GB->MB
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar plan');
      }

      message.success(`Plan ${editingPlan ? 'actualizado' : 'creado'} exitosamente`);
      setModalVisible(false);
      setEditingPlan(null);
      form.resetFields();
      fetchPlans(pagination.current, pagination.pageSize, filters);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingPlan(null);
    form.resetFields();
  };

  // Menú dropdown para filtros por columna
  const getColumnFilterDropdown = (column, placeholder) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={placeholder}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            confirm();
            handleColumnFilter(column, selectedKeys[0] || '');
          }}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => {
              confirm();
              handleColumnFilter(column, selectedKeys[0] || '');
            }}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Buscar
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              handleColumnFilter(column, '');
            }}
            size="small"
            style={{ width: 90 }}
          >
            Limpiar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    filteredValue: filters[column] ? [filters[column]] : null
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Nombre del Plan',
      dataIndex: 'planName',
      key: 'planName',
      sorter: true,
      ...getColumnFilterDropdown('planName', 'Buscar por nombre'),
    },
    {
      title: 'Costo Mensual',
      dataIndex: 'cost',
      key: 'cost',
      width: 150,
      sorter: true,
      render: (cost) => (
        <Tag color="red" style={{ fontSize: '12px' }}>
          Q{parseFloat(cost).toLocaleString('es-GT')}
        </Tag>
      ),
      ...getColumnFilterDropdown('cost', 'Buscar por costo'),
    },
    {
      title: 'Datos (GB)',
      dataIndex: 'megabytes',
      key: 'megabytes',
      width: 130,
      sorter: true,
      render: (data) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          {(parseInt(data) / 1024).toFixed(1)} GB
        </Tag>
      ),
      ...getColumnFilterDropdown('megabytes', 'Buscar por datos'),
    },
    {
      title: 'Minutos',
      dataIndex: 'minutes',
      key: 'minutes',
      width: 120,
      sorter: true,
      render: (minutes) => (
        <Tag color="green" style={{ fontSize: '12px' }}>
          {minutes}
        </Tag>
      ),
      ...getColumnFilterDropdown('minutes', 'Buscar por minutos'),
    },
    {
      title: 'Servicios Adicionales',
      dataIndex: 'additionalServices',
      key: 'additionalServices',
      ellipsis: true,
      render: (services) => (
        services ? (
          <span style={{ fontSize: '12px' }}>{services}</span>
        ) : (
          <em style={{ color: '#999', fontSize: '11px' }}>Sin servicios adicionales</em>
        )
      ),
      ...getColumnFilterDropdown('additionalServices', 'Buscar por servicios'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Editar"
          />
          <Popconfirm
            title="¿Estás seguro de eliminar este plan?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>
          Gestión de Planes
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
          title="Presiona F2 para crear nuevo plan"
        >
          Nuevo Plan (F2)
        </Button>
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Búsqueda global */}
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Búsqueda global en todos los campos..."
            allowClear
            enterButton="Buscar"
            size="large"
            onSearch={handleGlobalSearch}
            onChange={(e) => {
              const value = e.target.value;
              handleGlobalSearch(value);
            }}
            value={filters.global}
            style={{ width: '100%' }}
          />
        </Col>
        {/* Selector de registros por página */}
        <Col xs={24} sm={12} md={4}>
          <Select
            style={{ width: '100%' }}
            value={pagination.pageSize}
            onChange={(value) => {
              const newPagination = { ...pagination, pageSize: value, current: 1 };
              setPagination(newPagination);
              fetchPlans(1, value, filters);
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
            size="large"
            style={{ width: '100%' }}
            disabled={activeFilters.length === 0}
          >
            Limpiar Filtros
          </Button>
        </Col>
        {/* Información de registros */}
        <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
          <Text type="secondary" style={{ fontSize: '14px', lineHeight: '40px' }}>
            {pagination.total > 0 ? (
              <>
                Mostrando{' '}
                <Text strong>
                  {(pagination.current - 1) * pagination.pageSize + 1}-
                  {Math.min(pagination.current * pagination.pageSize, pagination.total)}
                </Text>{' '}
                de <Text strong>{pagination.total}</Text> registros
                {activeFilters.length > 0 && (
                  <>
                    {' '}(filtrado de {pagination.total} registros totales)
                  </>
                )}
              </>
            ) : null}
          </Text>
        </Col>
      </Row>
      <Space wrap style={{ marginBottom: 16 }}>
        {activeFilters.map((filter) => (
          <Tag
            key={filter.key}
            closable
            onClose={() => clearFilter(filter.key)}
            color="blue"
          >
            {filter.label}: {filter.value}
          </Tag>
        ))}
      </Space>
      <Table
        columns={columns}
        dataSource={partialResults.length > 0 ? partialResults : data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: () => null,
          size: 'default',
        }}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
        size="middle"
        bordered
      />
      <Modal
        title={editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={() => form.submit()}
        okText={editingPlan ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Nombre del Plan"
            name="planName"
            rules={[
              { required: true, message: 'Por favor ingresa el nombre del plan' },
              { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
            ]}
          >
            <Input ref={firstInputRef} placeholder="Ej: Plan Básico 5GB" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Costo Mensual (Q)"
                name="cost"
                rules={[
                  { required: true, message: 'Por favor ingresa el costo' },
                  { type: 'number', min: 0, message: 'El costo debe ser mayor a 0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Ej: 25000"
                  formatter={value => `Q ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/Q\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Datos (GB)"
                name="megabytes"
                rules={[
                  { required: true, message: 'Por favor ingresa los datos en GB' },
                  { type: 'number', min: 0, message: 'Los GB deben ser mayor a 0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Ej: 5"
                  step={0.1}
                  formatter={value => `${value} GB`}
                  parser={value => value.replace(' GB', '')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Minutos"
                name="minutes"
                rules={[
                  { required: true, message: 'Por favor ingresa los minutos' }
                ]}
              >
                <Input
                  placeholder="Ej: Ilimitados, 300 minutos, Solo WhatsApp"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Servicios Adicionales"
                name="additionalServices"
                rules={[
                  { required: false }
                ]}
              >
                <Input
                  placeholder="Ej: Roaming, SMS internacionales"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

export default PlansList;