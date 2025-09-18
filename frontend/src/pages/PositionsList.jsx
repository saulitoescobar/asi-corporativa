import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, 
  Typography, 
  Button, 
  Space, 
  Input, 
  Modal, 
  Form, 
  message, 
  Popconfirm, 
  Tag,
  Row,
  Col,
  Select,
  Breadcrumb,
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ClearOutlined
} from '@ant-design/icons';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const PositionsList = () => {
  // Estados principales
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [form] = Form.useForm();
  const firstInputRef = useRef(null);

  // Estados para el sistema de búsqueda avanzada tipo DataTables
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '25', '50', '100'],
    showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} posiciones`,
  });

  // Estados para filtros avanzados tipo DataTables
  const [filters, setFilters] = useState({
    global: '',
    name: '',
  });

  // Estados para resultados parciales y filtros activos
  const [partialResults, setPartialResults] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    fetchPositions();
  }, []);

  // Efecto para hacer focus en el primer campo cuando se abre el modal
  useEffect(() => {
    if (modalVisible && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current.focus();
      }, 100);
    }
  }, [modalVisible]);

  const fetchPositions = async (page = 1, pageSize = 10, currentFilters = filters) => {
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
      if (currentFilters.name) {
        queryParams.append('name', currentFilters.name);
      }

      const url = `http://localhost:3001/api/positions?${queryParams.toString()}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al obtener posiciones');
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
        setData(result.positions || result.data || result);
        setPagination(prev => ({
          ...prev,
          current: result.pagination?.current || page,
          total: result.pagination?.total || result.total || (result.positions?.length || result.data?.length || result.length || 0),
          pageSize: pageSize,
        }));
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      message.error('Error al cargar las posiciones');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationInfo) => {
    fetchPositions(paginationInfo.current, paginationInfo.pageSize, filters);
  };

  // Búsqueda global tipo DataTables con debounce
  const debounceRef = useRef();
  const handleGlobalSearch = (value) => {
    // Filtrado parcial local
    setFilters(prev => ({ ...prev, global: value }));
    if (value.length > 0) {
      const filtered = data.filter(position => {
        return Object.values(position).some(v =>
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
      fetchPositions(1, pagination.pageSize, newFilters);
      updateActiveFilters(newFilters);
      setPartialResults([]);
    }, 1000); // 1s debounce para consulta final
  };

  // Filtros por columna tipo DataTables
  const handleColumnFilter = (column, value) => {
    const newFilters = { ...filters, [column]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchPositions(1, pagination.pageSize, newFilters);
    updateActiveFilters(newFilters);
  };

  // Actualizar etiquetas de filtros activos
  const updateActiveFilters = (currentFilters) => {
    const active = [];
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && key !== 'global') {
        active.push({
          key,
          label: getFilterLabel(key),
          value,
        });
      }
    });
    setActiveFilters(active);
  };

  const getFilterLabel = (key) => {
    const labels = {
      name: 'Nombre',
    };
    return labels[key] || key;
  };

  // Limpiar filtros
  const clearFilters = () => {
    const newFilters = { global: '', name: '' };
    setFilters(newFilters);
    setActiveFilters([]);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchPositions(1, pagination.pageSize, newFilters);
  };

  // Limpiar todos los filtros (alias para compatibilidad)
  const clearAllFilters = () => {
    clearFilters();
  };

  // Limpiar filtro específico
  const clearFilter = (filterKey) => {
    const newFilters = { ...filters, [filterKey]: '' };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchPositions(1, pagination.pageSize, newFilters);
    updateActiveFilters(newFilters);
  };

  // Función para obtener el dropdown de filtro por columna
  const getColumnFilterDropdown = (column, placeholder) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters: clearColumnFilter }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={placeholder}
          value={selectedKeys[0]}
          onChange={e => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
            handleColumnFilter(column, e.target.value);
          }}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Buscar
          </Button>
          <Button
            onClick={() => {
              clearColumnFilter();
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
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
  });

  // CRUD Operations
  const handleCreate = () => {
    setEditingPosition(null);
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
    setEditingPosition(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/positions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la posición');
      }

      message.success('Posición eliminada exitosamente');
      fetchPositions(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      console.error('Error deleting position:', error);
      message.error(error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingPosition 
        ? `http://localhost:3001/api/positions/${editingPosition.id}`
        : 'http://localhost:3001/api/positions';
      
      const method = editingPosition ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la posición');
      }

      message.success(editingPosition ? 'Posición actualizada exitosamente' : 'Posición creada exitosamente');
      setModalVisible(false);
      form.resetFields();
      fetchPositions(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      console.error('Error saving position:', error);
      message.error(error.message);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingPosition(null);
  };

  // Configuración de columnas
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Nombre del Puesto',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          {name}
        </Tag>
      ),
      ...getColumnFilterDropdown('name', 'Buscar por nombre'),
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
            title="¿Estás seguro de eliminar esta posición?"
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

  // Datos para mostrar (con resultados parciales si están disponibles)
  const displayData = partialResults.length > 0 ? partialResults : data;

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item>Gestión de Posiciones</Breadcrumb.Item>
        <Breadcrumb.Item>Lista de posiciones</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header con título y botón nuevo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Gestión de Posiciones
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
          title="Presiona F2 para crear nueva posición"
        >
          Nueva Posición (F2)
        </Button>
      </div>

      {/* Controles tipo DataTables */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Búsqueda global */}
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Búsqueda global en todos los campos..."
            value={filters.global}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            onSearch={handleGlobalSearch}
            allowClear
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
              const newPagination = { ...pagination, pageSize: value, current: 1 };
              setPagination(newPagination);
              fetchPositions(1, value, filters);
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
          <Typography.Text type="secondary" style={{ fontSize: '14px', lineHeight: '40px' }}>
            {pagination.total > 0 ? (
              <>
                Mostrando{' '}
                <Typography.Text strong>
                  {(pagination.current - 1) * pagination.pageSize + 1}-
                  {Math.min(pagination.current * pagination.pageSize, pagination.total)}
                </Typography.Text>{' '}
                de <Typography.Text strong>{pagination.total}</Typography.Text> registros
                {activeFilters.length > 0 && (
                  <>
                    {' '}(filtrado de {pagination.total} registros totales)
                  </>
                )}
              </>
            ) : null}
          </Typography.Text>
        </Col>
      </Row>

      {/* Tags de filtros activos */}
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
        dataSource={displayData}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
        size="middle"
        bordered
      />

      {/* Modal para crear/editar */}
      <Modal
        title={editingPosition ? 'Editar Posición' : 'Nueva Posición'}
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={() => form.submit()}
        okText={editingPosition ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
        width={500}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Nombre del Puesto"
            name="name"
            rules={[
              { required: true, message: 'Por favor ingresa el nombre del puesto' },
              { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
            ]}
          >
            <Input ref={firstInputRef} placeholder="Ej: Gerente de Ventas" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PositionsList;