import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Space, 
  Breadcrumb, 
  Typography, 
  Spin, 
  Row, 
  Col, 
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  DatePicker,
  Card,
  Divider,
  Descriptions,
  Badge,
  Statistic
} from 'antd';
import { 
  EyeOutlined, 
  ClearOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  BankOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import dayjs from 'dayjs';

const { Search } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

export default function LinesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Estados para modal y formulario
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [form] = Form.useForm();
  
  // Estados para opciones de selects
  const [users, setUsers] = useState([]);
  const [telcos, setTelcos] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedTelco, setSelectedTelco] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  // Estados para filtros y búsqueda
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  
  // Estados para modal de vista
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingLine, setViewingLine] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
    pageSizeOptions: ['5', '10', '20', '50'],
  });

  // Función para crear nueva línea
  const handleCreate = () => {
    setEditingLine(null);
    form.resetFields();
    setSelectedTelco(null);
    setModalVisible(true);
    fetchOptionsData();
    // Establecer fecha de asignación por defecto a hoy
    form.setFieldsValue({ 
      assignmentDate: dayjs(),
      contractMonths: 12 
    });
  };

  // Hook para atajos de teclado
  useKeyboardShortcuts([
    { key: 'F2', callback: handleCreate }
  ]);

  useEffect(() => {
    fetchLines();
  }, []);

  useEffect(() => {
    filterLines();
  }, [data, searchText]); // eslint-disable-line react-hooks/exhaustive-deps

  const filterLines = () => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }
    
    let filtered = [...data];
    
    if (searchText && searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(line => {
        // Verificar cada campo de manera segura
        const lineNumber = line?.lineNumber || '';
        const userFirstName = line?.user?.firstName || '';
        const userLastName = line?.user?.lastName || '';
        const companyName = line?.company?.name || line?.user?.company?.name || '';
        const telcoName = line?.telco?.name || '';
        const status = line?.status || '';
        
        return (
          lineNumber.toLowerCase().includes(searchLower) ||
          userFirstName.toLowerCase().includes(searchLower) ||
          userLastName.toLowerCase().includes(searchLower) ||
          companyName.toLowerCase().includes(searchLower) ||
          telcoName.toLowerCase().includes(searchLower) ||
          status.toLowerCase().includes(searchLower)
        );
      });
    }
    
    setFilteredData(filtered);
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
    setSearchText(value);
    if (value && !appliedFilters.includes('search')) {
      setAppliedFilters(prev => [...prev, 'search']);
    } else if (!value) {
      setAppliedFilters(prev => prev.filter(f => f !== 'search'));
    }
  };

  // Función para ver detalles de la línea
  const handleView = async (record) => {
    setViewingLine(record);
    setViewModalVisible(true);
    
    // Si hay telco, cargar los asesores
    if (record.telco?.id) {
      try {
        const response = await fetch(`http://localhost:3001/api/advisors?telcoId=${record.telco.id}`);
        if (response.ok) {
          const advisorsData = await response.json();
          if (Array.isArray(advisorsData)) {
            const salesAdvisor = advisorsData.find(a => a.type === 'SALE');
            const postSalesAdvisor = advisorsData.find(a => a.type === 'POST_SALE');
            
            // Actualizar la línea con los asesores
            const updatedRecord = {
              ...record,
              salesAdvisor: salesAdvisor || null,
              postSalesAdvisor: postSalesAdvisor || null
            };
            setViewingLine(updatedRecord);
          }
        }
      } catch (error) {
        console.error('Error fetching advisors:', error);
      }
    }
  };

  const fetchLines = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/lines');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const lines = await response.json();
      const validLines = Array.isArray(lines) ? lines : [];
      
      setData(validLines);
      setFilteredData(validLines);
      setPagination(prev => ({
        ...prev,
        total: validLines.length
      }));
    } catch (error) {
      console.error('Error fetching lines:', error);
      message.error('Error al cargar las líneas');
      // En caso de error, establecer arrays vacíos
      setData([]);
      setFilteredData([]);
      setPagination(prev => ({
        ...prev,
        total: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos para los selects
  const fetchOptionsData = async () => {
    setLoadingOptions(true);
    try {
      const [usersRes, telcosRes, plansRes] = await Promise.all([
        fetch('http://localhost:3001/api/users'),
        fetch('http://localhost:3001/api/telcos/all'), // Usar la nueva ruta
        fetch('http://localhost:3001/api/plans')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        setUsers([]);
      }
      
      if (telcosRes.ok) {
        const telcosData = await telcosRes.json();
        setTelcos(Array.isArray(telcosData) ? telcosData : []);
      } else {
        setTelcos([]);
      }
      
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(Array.isArray(plansData) ? plansData : []);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      message.error('Error al cargar las opciones');
      // Asegurar que todos los estados sean arrays vacíos en caso de error
      setUsers([]);
      setTelcos([]);
      setPlans([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  // Manejar cambio de telco (mostrar información de asesores)
  const handleTelcoChange = async (telcoId) => {
    const telcoSelected = telcos.find(t => t.id === telcoId);
    setSelectedTelco(telcoSelected);
    
    if (telcoId) {
      try {
        const response = await fetch(`http://localhost:3001/api/advisors?telcoId=${telcoId}`);
        if (response.ok) {
          const advisorsData = await response.json();
          if (Array.isArray(advisorsData) && advisorsData.length > 0) {
            const salesAdvisors = advisorsData.filter(a => a.type === 'SALE');
            const postSalesAdvisors = advisorsData.filter(a => a.type === 'POST_SALE');
            
            let advisorInfo = `Esta telco tiene ${advisorsData.length} asesor(es):`;
            if (salesAdvisors.length > 0) {
              advisorInfo += ` Ventas: ${salesAdvisors.map(a => a.name).join(', ')}`;
            }
            if (postSalesAdvisors.length > 0) {
              advisorInfo += ` Post-Venta: ${postSalesAdvisors.map(a => a.name).join(', ')}`;
            }
            
            message.info(advisorInfo);
          } else {
            message.warning('Esta telco no tiene asesores asignados');
          }
        }
      } catch (error) {
        console.error('Error fetching advisors for telco:', error);
      }
    } else {
      setSelectedTelco(null);
    }
  };

  // Calcular fecha de renovación automáticamente
  const handleContractChange = () => {
    const startDate = form.getFieldValue('startDate');
    const contractMonths = form.getFieldValue('contractMonths');
    
    if (startDate && contractMonths) {
      const renewalDate = dayjs(startDate).add(contractMonths, 'month');
      form.setFieldsValue({ renewalDate });
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (values) => {
    try {
      const url = editingLine 
        ? `http://localhost:3001/api/lines/${editingLine.id}`
        : 'http://localhost:3001/api/lines';
      
      const method = editingLine ? 'PUT' : 'POST';

      // Formatear fechas para envío
      const submitData = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        renewalDate: values.renewalDate ? values.renewalDate.format('YYYY-MM-DD') : null,
        assignmentDate: values.assignmentDate ? values.assignmentDate.format('YYYY-MM-DD') : null,
        // No enviamos advisorId ya que se hereda de la telco
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
        throw new Error(errorData.error || 'Error al guardar la línea');
      }

      message.success(editingLine ? 'Línea actualizada exitosamente' : 'Línea creada exitosamente');
      setModalVisible(false);
      form.resetFields();
      fetchLines();
    } catch (error) {
      console.error('Error saving line:', error);
      message.error(error.message);
    }
  };

  // Cerrar modal
  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingLine(null);
  };

  // Editar línea
  const handleEdit = (line) => {
    setEditingLine(line);
    const telcoSelected = telcos.find(t => t.id === line.telcoId);
    setSelectedTelco(telcoSelected);
    
    // Mostrar información de asesores para la telco
    if (line.telcoId) {
      handleTelcoChange(line.telcoId);
    }
    
    form.setFieldsValue({
      ...line,
      startDate: line.startDate ? dayjs(line.startDate) : null,
      renewalDate: line.renewalDate ? dayjs(line.renewalDate) : null,
      assignmentDate: line.assignmentDate ? dayjs(line.assignmentDate) : null,
      monthlyCost: line.monthlyCost || '',
      notes: line.notes || '',
    });
    setModalVisible(true);
    fetchOptionsData();
  };

  // Eliminar línea
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/lines/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la línea');
      }

      message.success('Línea eliminada exitosamente');
      fetchLines();
    } catch (error) {
      console.error('Error deleting line:', error);
      message.error(error.message);
    }
  };

  // Cambiar estado de línea (activar/desactivar)
  const handleToggleStatus = async (line) => {
    try {
      const newStatus = line.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const response = await fetch(`http://localhost:3001/api/lines/${line.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar el estado de la línea');
      }

      message.success(`Línea ${newStatus === 'ACTIVE' ? 'activada' : 'desactivada'} exitosamente`);
      fetchLines();
    } catch (error) {
      console.error('Error toggling line status:', error);
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: 'ID de la línea',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Número de línea',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
    },
    {
      title: 'Usuario',
      key: 'user',
      render: (_, record) => {
        if (record.user) {
          return `${record.user.firstName} ${record.user.lastName}`;
        }
        return 'No asignado';
      },
    },
    {
      title: 'Empresa',
      key: 'company',
      render: (_, record) => {
        if (record.user && record.user.company) {
          return record.user.company.name;
        }
        return 'No asignada';
      },
    },
    {
      title: 'Plan',
      key: 'plan',
      render: (_, record) => {
        if (record.plan) {
          return `${record.plan.planName} - $${record.plan.cost}`;
        }
        return 'Sin plan';
      },
    },
    {
      title: 'Telco / Asesores',
      key: 'telco-advisors',
      width: 200,
      render: (_, record) => {
        if (record.telco) {
          return (
            <div>
              <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                {record.telco.name}
              </div>
              {record.advisor && (
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                  Asesor: {record.advisor.name} ({record.advisor.type})
                </div>
              )}
              {record.telco.salesAdvisorId && (
                <div style={{ fontSize: '10px', color: '#52c41a' }}>
                  📞 Ventas disponible
                </div>
              )}
              {record.telco.postSalesAdvisorId && (
                <div style={{ fontSize: '10px', color: '#fa8c16' }}>
                  🔧 Post-venta disponible
                </div>
              )}
            </div>
          );
        }
        return 'Sin telco';
      },
    },
    {
      title: 'Fecha Asignación',
      dataIndex: 'assignmentDate',
      key: 'assignmentDate',
      render: (date) => {
        if (date) {
          return dayjs(date).format('DD/MM/YYYY');
        }
        return '-';
      },
    },
    {
      title: 'Inicio Contrato',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => {
        if (date) {
          return dayjs(date).format('DD/MM/YYYY');
        }
        return '-';
      },
    },
    {
      title: 'Duración',
      dataIndex: 'contractMonths',
      key: 'contractMonths',
      render: (months) => {
        if (months) {
          return `${months} meses`;
        }
        return '-';
      },
    },
    {
      title: 'Renovación',
      dataIndex: 'renewalDate',
      key: 'renewalDate',
      render: (date) => {
        if (date) {
          const renewalDate = dayjs(date);
          const today = dayjs();
          const daysUntilRenewal = renewalDate.diff(today, 'days');
          
          let color = 'default';
          if (daysUntilRenewal <= 30) color = 'red';
          else if (daysUntilRenewal <= 90) color = 'orange';
          else color = 'green';
          
          return (
            <Tag color={color}>
              {renewalDate.format('DD/MM/YYYY')}
              {daysUntilRenewal <= 90 && (
                <div style={{ fontSize: '11px' }}>
                  ({daysUntilRenewal > 0 ? `${daysUntilRenewal} días` : 'Vencido'})
                </div>
              )}
            </Tag>
          );
        }
        return '-';
      },
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'green';
        if (status === 'INACTIVE') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
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
            onClick={() => handleEdit(record)}
            title="Editar línea"
          />
          <Button 
            type="link" 
            icon={record.status === 'ACTIVE' ? <PauseCircleOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleToggleStatus(record)}
            title={record.status === 'ACTIVE' ? 'Desactivar línea' : 'Activar línea'}
            style={{ 
              color: record.status === 'ACTIVE' ? '#fa8c16' : '#52c41a' 
            }}
          />
          <Popconfirm
            title="¿Estás seguro de eliminar esta línea?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button 
              type="link" 
              icon={<DeleteOutlined />} 
              danger
              title="Eliminar línea"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb style={{ marginBottom: 8 }}>
          <Breadcrumb.Item>Tablero</Breadcrumb.Item>
          <Breadcrumb.Item>Líneas</Breadcrumb.Item>
          <Breadcrumb.Item>Lista de líneas</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* Header con título y botón nuevo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Todas las líneas</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
          title="Presiona F2 para crear nueva línea"
        >
          Nueva Línea (F2)
        </Button>
      </div>

      {/* Controles de DataTable */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Búsqueda global */}
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Buscar líneas..."
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
                    {' '}(filtrado de {data.length} registros totales)
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

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={pagination}
          onChange={(paginationInfo) => {
            setPagination(paginationInfo);
          }}
        />
      </Spin>

      {/* Modal para ver detalles de línea */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            <PhoneOutlined style={{ color: '#1890ff' }} />
            Detalles de la Línea
          </div>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button 
            key="close" 
            type="primary" 
            size="large"
            onClick={() => setViewModalVisible(false)}
            style={{ borderRadius: '6px' }}
          >
            Cerrar
          </Button>
        ]}
        width={900}
        styles={{
          body: { padding: '24px' }
        }}
      >
        {viewingLine && (
          <div>
            {/* Header con información principal */}
            <Card 
              style={{ 
                marginBottom: '24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <PhoneOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {viewingLine.lineNumber}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                      Número de Línea
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    {viewingLine.status === 'ACTIVE' ? 
                      <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }} /> :
                      viewingLine.status === 'SUSPENDED' ? 
                      <PauseCircleOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '8px' }} /> :
                      <StopOutlined style={{ fontSize: '32px', color: '#ff4d4f', marginBottom: '8px' }} />
                    }
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                      <Badge 
                        status={
                          viewingLine.status === 'ACTIVE' ? 'success' :
                          viewingLine.status === 'SUSPENDED' ? 'warning' : 'error'
                        }
                        text={
                          viewingLine.status === 'ACTIVE' ? 'Activa' :
                          viewingLine.status === 'SUSPENDED' ? 'Suspendida' :
                          viewingLine.status === 'CANCELLED' ? 'Cancelada' : viewingLine.status
                        }
                        style={{ color: 'white', fontSize: '16px' }}
                      />
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                      Estado de la Línea
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Información del usuario y empresa */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserOutlined style={{ color: '#1890ff' }} />
                  Información del Usuario
                </div>
              }
              style={{ marginBottom: '24px', borderRadius: '8px' }}
              bodyStyle={{ padding: '24px' }}
            >
              <Descriptions column={2} size="middle">
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 'bold' }}>Usuario</span>}
                  span={1}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserOutlined style={{ color: '#52c41a' }} />
                    {viewingLine.user ? `${viewingLine.user.firstName} ${viewingLine.user.lastName}` : 'No asignado'}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 'bold' }}>Empresa</span>}
                  span={1}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BankOutlined style={{ color: '#722ed1' }} />
                    {viewingLine.company?.name || viewingLine.user?.company?.name || 'No asignada'}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Información técnica */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PhoneOutlined style={{ color: '#1890ff' }} />
                  Información Técnica
                </div>
              }
              style={{ marginBottom: '24px', borderRadius: '8px' }}
              bodyStyle={{ padding: '24px' }}
            >
              <Descriptions column={2} size="middle">
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 'bold' }}>Operador (Telco)</span>}
                  span={1}
                >
                  <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {viewingLine.telco?.name || 'No asignada'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 'bold' }}>Plan</span>}
                  span={1}
                >
                  <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {viewingLine.plan?.name || 'No asignado'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Información de asesores */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TeamOutlined style={{ color: '#1890ff' }} />
                  Asesores Asignados
                  {(viewingLine.salesAdvisor || viewingLine.postSalesAdvisor) && (
                    <Tag color="cyan" style={{ marginLeft: '8px' }}>
                      Heredados de {viewingLine.telco?.name}
                    </Tag>
                  )}
                </div>
              }
              style={{ marginBottom: '24px', borderRadius: '8px' }}
              bodyStyle={{ padding: '24px' }}
            >
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Card 
                    size="small" 
                    style={{ 
                      background: viewingLine.salesAdvisor ? '#f6ffed' : '#fafafa', 
                      border: viewingLine.salesAdvisor ? '1px solid #b7eb8f' : '1px solid #d9d9d9',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <TeamOutlined style={{ 
                        fontSize: '24px', 
                        color: viewingLine.salesAdvisor ? '#52c41a' : '#8c8c8c', 
                        marginBottom: '8px' 
                      }} />
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        Asesor de Ventas
                        {viewingLine.salesAdvisor && (
                          <div style={{ fontSize: '10px', color: '#1890ff', marginTop: '2px' }}>
                            (de {viewingLine.telco?.name})
                          </div>
                        )}
                      </div>
                      <div style={{ 
                        color: viewingLine.salesAdvisor ? '#52c41a' : '#8c8c8c', 
                        fontSize: '16px' 
                      }}>
                        {viewingLine.salesAdvisor?.name || 'No asignado'}
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card 
                    size="small" 
                    style={{ 
                      background: viewingLine.postSalesAdvisor ? '#fff7e6' : '#fafafa', 
                      border: viewingLine.postSalesAdvisor ? '1px solid #ffd591' : '1px solid #d9d9d9',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <TeamOutlined style={{ 
                        fontSize: '24px', 
                        color: viewingLine.postSalesAdvisor ? '#fa8c16' : '#8c8c8c', 
                        marginBottom: '8px' 
                      }} />
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        Asesor Post-Venta
                        {viewingLine.postSalesAdvisor && (
                          <div style={{ fontSize: '10px', color: '#1890ff', marginTop: '2px' }}>
                            (de {viewingLine.telco?.name})
                          </div>
                        )}
                      </div>
                      <div style={{ 
                        color: viewingLine.postSalesAdvisor ? '#fa8c16' : '#8c8c8c', 
                        fontSize: '16px' 
                      }}>
                        {viewingLine.postSalesAdvisor?.name || 'No asignado'}
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* Información contractual y financiera */}
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CalendarOutlined style={{ color: '#1890ff' }} />
                      Información Contractual
                    </div>
                  }
                  style={{ borderRadius: '8px', height: '100%' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Statistic
                      title="Fecha de Asignación"
                      value={viewingLine.assignmentDate ? dayjs(viewingLine.assignmentDate).format('DD/MM/YYYY') : 'No asignada'}
                      prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
                      valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                    />
                    <Statistic
                      title="Duración del Contrato"
                      value={viewingLine.contractMonths || 'No especificado'}
                      suffix="meses"
                      prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
                      valueStyle={{ color: '#722ed1', fontSize: '18px' }}
                    />
                    {viewingLine.assignmentDate && viewingLine.contractMonths && (
                      <Statistic
                        title="Fecha de Renovación"
                        value={dayjs(viewingLine.assignmentDate).add(viewingLine.contractMonths, 'month').format('DD/MM/YYYY')}
                        prefix={<CalendarOutlined style={{ color: '#fa8c16' }} />}
                        valueStyle={{ color: '#fa8c16', fontSize: '18px' }}
                      />
                    )}
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarOutlined style={{ color: '#1890ff' }} />
                      Información Financiera
                    </div>
                  }
                  style={{ borderRadius: '8px', height: '100%' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <DollarOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                    <Statistic
                      title="Costo Mensual"
                      value={viewingLine.monthlyCost && viewingLine.monthlyCost > 0 ? viewingLine.monthlyCost : "No especificado"}
                      prefix={viewingLine.monthlyCost && viewingLine.monthlyCost > 0 ? "$" : ""}
                      precision={viewingLine.monthlyCost && viewingLine.monthlyCost > 0 ? 0 : undefined}
                      valueStyle={{ 
                        color: viewingLine.monthlyCost && viewingLine.monthlyCost > 0 ? '#52c41a' : '#8c8c8c', 
                        fontSize: viewingLine.monthlyCost && viewingLine.monthlyCost > 0 ? '32px' : '18px', 
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Notas adicionales */}
            {viewingLine.notes && (
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    Notas Adicionales
                  </div>
                }
                style={{ marginTop: '24px', borderRadius: '8px' }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ 
                  background: '#fafafa', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {viewingLine.notes}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Modal para crear/editar línea */}
      <Modal
        title={editingLine ? 'Editar Línea' : 'Nueva Línea'}
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={() => form.submit()}
        okText={editingLine ? 'Actualizar' : 'Crear'}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Número de Línea"
                name="lineNumber"
                rules={[
                  { required: true, message: 'Por favor ingresa el número de línea' },
                  { pattern: /^\d{8}$/, message: 'El número debe tener 8 dígitos' }
                ]}
              >
                <Input placeholder="12345678" maxLength={8} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Estado"
                name="status"
                rules={[
                  { required: true, message: 'Por favor selecciona un estado' }
                ]}
              >
                <Select placeholder="Selecciona el estado">
                  <Option value="ACTIVE">Activo</Option>
                  <Option value="INACTIVE">Inactivo</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Usuario"
                name="userId"
                rules={[
                  { required: true, message: 'Por favor selecciona un usuario' }
                ]}
              >
                <Select
                  placeholder="Selecciona un usuario"
                  loading={loadingOptions}
                  showSearch
                  optionFilterProp="children"
                >
                  {Array.isArray(users) && users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} - {user.cui}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Plan"
                name="planId"
                rules={[
                  { required: true, message: 'Por favor selecciona un plan' }
                ]}
              >
                <Select
                  placeholder="Selecciona un plan"
                  loading={loadingOptions}
                  showSearch
                  optionFilterProp="children"
                >
                  {Array.isArray(plans) && plans.map(plan => (
                    <Option key={plan.id} value={plan.id}>
                      {plan.planName} - Q{plan.cost}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Telco"
                name="telcoId"
                rules={[
                  { required: true, message: 'Por favor selecciona una telco' }
                ]}
              >
                <Select
                  placeholder="Selecciona una telco"
                  loading={loadingOptions}
                  showSearch
                  optionFilterProp="children"
                  onChange={handleTelcoChange}
                >
                  {Array.isArray(telcos) && telcos.map(telco => (
                    <Option key={telco.id} value={telco.id}>
                      {telco.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <div style={{ 
                border: '1px solid #d9d9d9', 
                borderRadius: '6px', 
                padding: '12px', 
                backgroundColor: '#fafafa',
                minHeight: '32px'
              }}>
                <div style={{ marginBottom: '4px', fontWeight: 'bold', color: '#666' }}>
                  Asesores de la Telco:
                </div>
                {selectedTelco ? (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Los asesores se heredan automáticamente de la telco seleccionada
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    Selecciona una telco para ver sus asesores
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: 16 }}>
                💡 Los asesores (ventas y post-venta) se asignan automáticamente según la telco
              </div>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Fecha de Asignación al Usuario"
                name="assignmentDate"
                rules={[
                  { required: true, message: 'Por favor selecciona la fecha de asignación' }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Fecha de asignación"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <div style={{ color: '#666', fontSize: '12px', marginTop: 8 }}>
                Esta fecha indica cuándo se asignó la línea al usuario
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Fecha de Inicio del Contrato"
                name="startDate"
                rules={[
                  { required: true, message: 'Por favor selecciona la fecha de inicio' }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Fecha de inicio"
                  onChange={handleContractChange}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Duración del Contrato (meses)"
                name="contractMonths"
                rules={[
                  { required: true, message: 'Por favor ingresa la duración' }
                ]}
              >
                <Select 
                  placeholder="Duración"
                  onChange={handleContractChange}
                >
                  <Option value={6}>6 meses</Option>
                  <Option value={12}>12 meses</Option>
                  <Option value={18}>18 meses</Option>
                  <Option value={24}>24 meses</Option>
                  <Option value={36}>36 meses</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Fecha de Renovación"
                name="renewalDate"
                tooltip="Se calcula automáticamente al seleccionar fecha de inicio y duración"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Se calcula automáticamente"
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Notas (Opcional)"
                name="notes"
              >
                <Input.TextArea
                  placeholder="Notas adicionales sobre la línea..."
                  rows={3}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}