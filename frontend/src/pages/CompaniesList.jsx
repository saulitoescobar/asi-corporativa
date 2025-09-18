import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  Typography, 
  Spin, 
  Alert, 
  Button, 
  Modal, 
  Form, 
  Input, 
  message, 
  Popconfirm, 
  Space,
  Row,
  Col,
  Select,
  Tag,
  Breadcrumb,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ClearOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Search } = Input;

const CompaniesList = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [form] = Form.useForm();
  
  // Estados para filtros y búsqueda
  const [searchText, setSearchText] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState([]);
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

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchText]);

  const filterCompanies = () => {
    let filtered = [...companies];
    
    if (searchText) {
      filtered = filtered.filter(company =>
        company.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        company.nit?.toLowerCase().includes(searchText.toLowerCase()) ||
        company.address?.toLowerCase().includes(searchText.toLowerCase()) ||
        company.phone?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setFilteredCompanies(filtered);
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

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/companies');
      if (!response.ok) {
        throw new Error('Error al cargar empresas');
      }
      const data = await response.json();
      setCompanies(data);
      setFilteredCompanies(data);
      setPagination(prev => ({
        ...prev,
        total: data.length
      }));
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
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item>Gestión de Empresas</Breadcrumb.Item>
        <Breadcrumb.Item>Lista de empresas</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header con título y botón nuevo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Gestión de Empresas
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
          size="large"
        >
          Nueva Empresa
        </Button>
      </div>

      {/* Controles de DataTable */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Búsqueda global */}
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Buscar empresas..."
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
            {filteredCompanies.length > 0 ? (
              <>
                Mostrando{' '}
                <Text strong>
                  {(pagination.current - 1) * pagination.pageSize + 1}-
                  {Math.min(pagination.current * pagination.pageSize, filteredCompanies.length)}
                </Text>{' '}
                de <Text strong>{filteredCompanies.length}</Text> registros
                {appliedFilters.length > 0 && (
                  <>
                    {' '}(filtrado de {companies.length} registros totales)
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
        dataSource={filteredCompanies} 
        rowKey="id"
        pagination={pagination}
        scroll={{ x: 1200 }}
        loading={loading}
        onChange={(paginationInfo) => {
          setPagination(paginationInfo);
        }}
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