import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  Typography, 
  Spin, 
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
  DatePicker
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ClearOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

const { Title } = Typography;
const { Option } = Select;

export default function UsersList() {
  const navigate = useNavigate();
  
  // Estados principales
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const firstInputRef = useRef(null);

  // Estados para opciones de dropdowns
  const [companies, setCompanies] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Estados para el sistema de búsqueda avanzada tipo DataTables
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '25', '50', '100'],
    showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} usuarios`,
  });

  // Estados para filtros avanzados tipo DataTables
  const [filters, setFilters] = useState({
    global: '',
    firstName: '',
    lastName: '',
    cui: '',
    company: '',
    position: '',
  });

  // Estados para resultados parciales y filtros activos
  const [partialResults, setPartialResults] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchOptionsData();
  }, []);

  // Efecto para hacer focus en el primer campo cuando se abre el modal
  useEffect(() => {
    if (modalVisible && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current.focus();
      }, 100);
    }
  }, [modalVisible]);

  const fetchUsers = async (page = 1, pageSize = 10, currentFilters = filters) => {
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
      if (currentFilters.firstName) {
        queryParams.append('firstName', currentFilters.firstName);
      }
      if (currentFilters.lastName) {
        queryParams.append('lastName', currentFilters.lastName);
      }
      if (currentFilters.cui) {
        queryParams.append('cui', currentFilters.cui);
      }
      if (currentFilters.company) {
        queryParams.append('company', currentFilters.company);
      }
      if (currentFilters.position) {
        queryParams.append('position', currentFilters.position);
      }

      const url = `http://localhost:3001/api/users?${queryParams.toString()}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
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
        setData(result.users || result.data || result);
        setPagination(prev => ({
          ...prev,
          current: result.pagination?.current || page,
          total: result.pagination?.total || result.total || (result.users?.length || result.data?.length || result.length || 0),
          pageSize: pageSize,
        }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptionsData = async () => {
    setLoadingOptions(true);
    try {
      const [companiesRes, positionsRes] = await Promise.all([
        fetch('http://localhost:3001/api/companies'),
        fetch('http://localhost:3001/api/positions')
      ]);

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData);
      }

      if (positionsRes.ok) {
        const positionsData = await positionsRes.json();
        setPositions(positionsData);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      message.error('Error al cargar las opciones');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleTableChange = (paginationInfo) => {
    fetchUsers(paginationInfo.current, paginationInfo.pageSize, filters);
  };

  // Búsqueda global tipo DataTables con debounce
  const debounceRef = useRef();
  const handleGlobalSearch = (value) => {
    // Filtrado parcial local
    setFilters(prev => ({ ...prev, global: value }));
    if (value.length > 0) {
      const filtered = data.filter(user => {
        return Object.values(user).some(v =>
          String(v).toLowerCase().includes(value.toLowerCase())
        ) || 
        user.company?.name?.toLowerCase().includes(value.toLowerCase()) ||
        user.position?.name?.toLowerCase().includes(value.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(value.toLowerCase());
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
      fetchUsers(1, pagination.pageSize, newFilters);
      updateActiveFilters(newFilters);
      setPartialResults([]);
    }, 1000); // 1s debounce para consulta final
  };

  // Filtros por columna tipo DataTables
  const handleColumnFilter = (column, value) => {
    const newFilters = { ...filters, [column]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchUsers(1, pagination.pageSize, newFilters);
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
      firstName: 'Nombre',
      lastName: 'Apellido',
      cui: 'CUI',
      company: 'Empresa',
      position: 'Posición',
    };
    return labels[key] || key;
  };

  // Limpiar filtros
  const clearFilters = () => {
    const newFilters = { global: '', firstName: '', lastName: '', cui: '', company: '', position: '' };
    setFilters(newFilters);
    setActiveFilters([]);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchUsers(1, pagination.pageSize, newFilters);
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
    setEditingUser(null);
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
    setEditingUser(record);
    form.setFieldsValue({
      ...record,
      joinDate: record.joinDate ? dayjs(record.joinDate) : null,
      companyId: record.companyId,
      positionId: record.positionId,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el usuario');
      }

      message.success('Usuario eliminado exitosamente');
      fetchUsers(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error(error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingUser 
        ? `http://localhost:3001/api/users/${editingUser.id}`
        : 'http://localhost:3001/api/users';
      
      const method = editingUser ? 'PUT' : 'POST';

      // Formatear fecha
      const submitData = {
        ...values,
        joinDate: values.joinDate ? values.joinDate.format('YYYY-MM-DD') : null,
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
        throw new Error(errorData.error || 'Error al guardar el usuario');
      }

      message.success(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
      setModalVisible(false);
      form.resetFields();
      fetchUsers(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      console.error('Error saving user:', error);
      message.error(error.message);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingUser(null);
  };

  // Configuración de columnas
  const columns = [
    {
      title: 'CUI',
      dataIndex: 'cui',
      key: 'cui',
      width: 120,
      render: (cui) => (
        <Tag color="purple" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
          {cui}
        </Tag>
      ),
      ...getColumnFilterDropdown('cui', 'Buscar por CUI'),
    },
    {
      title: 'Nombre',
      dataIndex: 'firstName',
      key: 'firstName',
      render: (firstName) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          <UserOutlined /> {firstName}
        </Tag>
      ),
      ...getColumnFilterDropdown('firstName', 'Buscar por nombre'),
    },
    {
      title: 'Apellido',
      dataIndex: 'lastName',
      key: 'lastName',
      render: (lastName) => (
        <Tag color="cyan" style={{ fontSize: '12px' }}>
          {lastName}
        </Tag>
      ),
      ...getColumnFilterDropdown('lastName', 'Buscar por apellido'),
    },
    {
      title: 'Empresa',
      key: 'company',
      render: (_, record) => (
        record.company ? (
          <Tag color="green" style={{ fontSize: '12px' }}>
            {record.company.name}
          </Tag>
        ) : (
          <em style={{ color: '#999', fontSize: '11px' }}>Sin empresa</em>
        )
      ),
      ...getColumnFilterDropdown('company', 'Buscar por empresa'),
    },
    {
      title: 'Puesto',
      key: 'position',
      render: (_, record) => (
        record.position ? (
          <Tag color="orange" style={{ fontSize: '12px' }}>
            {record.position.name}
          </Tag>
        ) : (
          <em style={{ color: '#999', fontSize: '11px' }}>Sin puesto</em>
        )
      ),
      ...getColumnFilterDropdown('position', 'Buscar por puesto'),
    },
    {
      title: 'Fecha de Ingreso',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 130,
      render: (date) => (
        <Tag color="volcano" style={{ fontSize: '11px' }}>
          {date ? dayjs(date).format('DD/MM/YYYY') : 'No definida'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/usuarios/${record.id}`)}
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
            title="¿Estás seguro de eliminar este usuario?"
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
    <div style={{ padding: '20px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Usuarios
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
            title="Presiona F2 para crear nuevo usuario"
          >
            Nuevo Usuario (F2)
          </Button>
        </Col>
      </Row>

      {/* Barra de búsqueda global estilo DataTables */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Buscar en todas las columnas..."
            prefix={<SearchOutlined />}
            value={filters.global}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            allowClear
            size="large"
          />
        </Col>
        <Col xs={24} sm={12} md={16}>
          <Space wrap>
            {activeFilters.map((filter) => (
              <Tag
                key={filter.key}
                closable
                onClose={() => handleColumnFilter(filter.key, '')}
                color="blue"
              >
                {filter.label}: {filter.value}
              </Tag>
            ))}
            {activeFilters.length > 0 && (
              <Button
                type="link"
                onClick={clearFilters}
                icon={<ClearOutlined />}
                size="small"
              >
                Limpiar filtros
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={displayData}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
        size="middle"
        bordered
      />

      {/* Modal para crear/editar */}
      <Modal
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={() => form.submit()}
        okText={editingUser ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="CUI"
                name="cui"
                rules={[
                  { required: true, message: 'Por favor ingresa el CUI' },
                  { len: 13, message: 'El CUI debe tener exactamente 13 dígitos' },
                  { pattern: /^\d+$/, message: 'El CUI solo debe contener números' }
                ]}
              >
                <Input 
                  ref={firstInputRef}
                  placeholder="1234567890123" 
                  maxLength={13}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Fecha de Ingreso"
                name="joinDate"
                rules={[
                  { required: true, message: 'Por favor selecciona la fecha de ingreso' }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Selecciona fecha"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombre"
                name="firstName"
                rules={[
                  { required: true, message: 'Por favor ingresa el nombre' },
                  { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
                ]}
              >
                <Input placeholder="Ej: Juan" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Apellido"
                name="lastName"
                rules={[
                  { required: true, message: 'Por favor ingresa el apellido' },
                  { min: 2, message: 'El apellido debe tener al menos 2 caracteres' }
                ]}
              >
                <Input placeholder="Ej: García" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Empresa"
                name="companyId"
                rules={[
                  { required: true, message: 'Por favor selecciona una empresa' }
                ]}
              >
                <Select
                  placeholder="Selecciona una empresa"
                  loading={loadingOptions}
                  showSearch
                  optionFilterProp="children"
                >
                  {companies.map(company => (
                    <Option key={company.id} value={company.id}>
                      {company.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Posición"
                name="positionId"
                rules={[
                  { required: true, message: 'Por favor selecciona una posición' }
                ]}
              >
                <Select
                  placeholder="Selecciona una posición"
                  loading={loadingOptions}
                  showSearch
                  optionFilterProp="children"
                >
                  {positions.map(position => (
                    <Option key={position.id} value={position.id}>
                      {position.name}
                    </Option>
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