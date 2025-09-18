import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Breadcrumb
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ClearOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

function TelcosList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTelco, setEditingTelco] = useState(null);
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
    name: '',
    address: '',
    phone: '',
    salesAdvisor: '',
    postSalesAdvisor: '',
  });
  
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    fetchTelcos();
    fetchAdvisors();
  }, []);

  // Efecto para hacer focus en el primer campo cuando se abre el modal
  useEffect(() => {
    if (modalVisible && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current.focus();
      }, 100);
    }
  }, [modalVisible]);

  const fetchTelcos = async (page = 1, pageSize = 10, currentFilters = filters) => {
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
        console.log('Agregando búsqueda global:', currentFilters.global); // Debug log
      }
      if (currentFilters.name) {
        queryParams.append('name', currentFilters.name);
      }
      if (currentFilters.address) {
        queryParams.append('address', currentFilters.address);
      }
      if (currentFilters.phone) {
        queryParams.append('phone', currentFilters.phone);
      }

      const url = `http://localhost:3001/api/telcos?${queryParams.toString()}`;
      console.log('URL de la API:', url); // Debug log

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al obtener telcos');
      }
      
      const result = await response.json();
      console.log('Resultado de la API:', result); // Debug log
      setData(result.telcos);
      setPagination(prev => ({
        ...prev,
        current: result.pagination.current,
        total: result.pagination.total,
        pageSize: pageSize,
      }));
    } catch (error) {
      console.error('Error fetching telcos:', error);
      message.error('Error al cargar los telcos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvisors = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/advisors');
      if (response.ok) {
        const advisorsData = await response.json();
        setAdvisors(advisorsData);
      }
    } catch (error) {
      console.error('Error fetching advisors:', error);
    }
  };

  const handleTableChange = (paginationInfo) => {
    fetchTelcos(paginationInfo.current, paginationInfo.pageSize, filters);
  };

  // Búsqueda global tipo DataTables con debounce
  const debounceRef = useRef();
  // Mejor debounce: solo filtra tras dejar de escribir 500ms
  const handleGlobalSearch = (value) => {
    // Filtrado parcial local
    setFilters(prev => ({ ...prev, global: value }));
    if (value.length > 0) {
      const filtered = data.filter(telco => {
        return Object.values(telco).some(v =>
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
      fetchTelcos(1, pagination.pageSize, newFilters);
      updateActiveFilters(newFilters);
      setPartialResults([]);
    }, 1000); // 1s debounce para consulta final
  };

  // Filtros por columna tipo DataTables
  const handleColumnFilter = (column, value) => {
    const newFilters = { ...filters, [column]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchTelcos(1, pagination.pageSize, newFilters);
    updateActiveFilters(newFilters);
  };

  // Actualizar tags de filtros activos
  const updateActiveFilters = (currentFilters) => {
    const active = [];
    if (currentFilters.global) {
      active.push({ key: 'global', label: 'Búsqueda Global', value: currentFilters.global });
    }
    if (currentFilters.name) {
      active.push({ key: 'name', label: 'Nombre', value: currentFilters.name });
    }
    if (currentFilters.address) {
      active.push({ key: 'address', label: 'Dirección', value: currentFilters.address });
    }
    if (currentFilters.phone) {
      active.push({ key: 'phone', label: 'Teléfono', value: currentFilters.phone });
    }
    setActiveFilters(active);
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    const clearedFilters = {
      global: '',
      name: '',
      address: '',
      phone: '',
      salesAdvisor: '',
      postSalesAdvisor: '',
    };
    setFilters(clearedFilters);
    setActiveFilters([]);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchTelcos(1, pagination.pageSize, clearedFilters);
  };

  // Limpiar filtro específico
  const clearFilter = (filterKey) => {
    const newFilters = { ...filters, [filterKey]: '' };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchTelcos(1, pagination.pageSize, newFilters);
    updateActiveFilters(newFilters);
  };

  const handleCreate = () => {
    setEditingTelco(null);
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
    setEditingTelco(record);
    form.setFieldsValue({
      name: record.name,
      address: record.address,
      phone: record.phone,
      salesAdvisorId: record.salesAdvisorId,
      postSalesAdvisorId: record.postSalesAdvisorId,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/telcos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar telco');
      }
      
      message.success('Telco eliminado exitosamente');
      fetchTelcos(pagination.current, pagination.pageSize, filters);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingTelco 
        ? `http://localhost:3001/api/telcos/${editingTelco.id}`
        : 'http://localhost:3001/api/telcos';
      
      const method = editingTelco ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar telco');
      }

      message.success(`Telco ${editingTelco ? 'actualizado' : 'creado'} exitosamente`);
      setModalVisible(false);
      setEditingTelco(null);
      form.resetFields();
      fetchTelcos(pagination.current, pagination.pageSize, filters);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingTelco(null);
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
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      ...getColumnFilterDropdown('name', 'Buscar por nombre'),
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      ...getColumnFilterDropdown('address', 'Buscar por dirección'),
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      ...getColumnFilterDropdown('phone', 'Buscar por teléfono'),
    },
    {
      title: 'Asesor de Ventas',
      key: 'salesAdvisor',
      width: 180,
      render: (_, record) => 
        record.salesAdvisor ? (
          <span style={{ color: '#1890ff' }}>{record.salesAdvisor.name}</span>
        ) : (
          <span style={{ color: '#999', fontStyle: 'italic' }}>Sin asignar</span>
        )
    },
    {
      title: 'Asesor Post Ventas',
      key: 'postSalesAdvisor',
      width: 180,
      render: (_, record) => 
        record.postSalesAdvisor ? (
          <span style={{ color: '#1890ff' }}>{record.postSalesAdvisor.name}</span>
        ) : (
          <span style={{ color: '#999', fontStyle: 'italic' }}>Sin asignar</span>
        )
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/telcos/${record.id}`)}
            title="Ver detalle"
          />
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Editar"
          />
          <Popconfirm
            title="¿Estás seguro de eliminar este telco?"
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
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item>Gestión de Telcos</Breadcrumb.Item>
        <Breadcrumb.Item>Lista de telcos</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header con título y botón nuevo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Gestión de Telcos
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
          title="Presiona F2 para crear nuevo telco"
        >
          Nuevo Telco (F2)
        </Button>
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Búsqueda global */}
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Búsqueda de Telcos..."
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
              fetchTelcos(1, value, filters);
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
        scroll={{ x: 1200 }}
        size="middle"
        bordered
      />
      <Modal
        title={editingTelco ? 'Editar Telco' : 'Nuevo Telco'}
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={() => form.submit()}
        okText={editingTelco ? 'Actualizar' : 'Crear'}
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
            label="Nombre"
            name="name"
            rules={[{ required: true, message: 'Por favor ingresa el nombre del telco' }, { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }]}
          >
            <Input ref={firstInputRef} placeholder="Ej: Claro Colombia" />
          </Form.Item>
          <Form.Item label="Dirección" name="address">
            <Input.TextArea placeholder="Ej: Calle 123 #45-67, Bogotá" rows={3} />
          </Form.Item>
          <Form.Item label="Teléfono" name="phone" rules={[{ pattern: /^[\d\s\-\+\(\)]+$/, message: 'Formato de teléfono inválido' }]}> 
            <Input placeholder="Ej: +57 1 234-5678" /> 
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Asesor de Ventas" name="salesAdvisorId">
                <Select placeholder="Seleccionar asesor" allowClear showSearch filterOption={(input, option) => option?.children?.toLowerCase().includes(input.toLowerCase())}>
                  {advisors.map((advisor) => (
                    <Option key={advisor.id} value={advisor.id}>{advisor.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Asesor Post Ventas" name="postSalesAdvisorId">
                <Select placeholder="Seleccionar asesor" allowClear showSearch filterOption={(input, option) => option?.children?.toLowerCase().includes(input.toLowerCase())}>
                  {advisors.map((advisor) => (
                    <Option key={advisor.id} value={advisor.id}>{advisor.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

export default TelcosList;