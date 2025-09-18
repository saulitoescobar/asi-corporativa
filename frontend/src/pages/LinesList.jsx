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
  Select
} from 'antd';
import { EyeOutlined, ClearOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

export default function LinesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Estados para filtros y búsqueda
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
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
    fetchLines();
  }, []);

  useEffect(() => {
    filterLines();
  }, [data, searchText]);

  const filterLines = () => {
    let filtered = [...data];
    
    if (searchText) {
      filtered = filtered.filter(line =>
        line.lineNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
        line.user?.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
        line.user?.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
        line.company?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        line.telco?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        line.status?.toLowerCase().includes(searchText.toLowerCase())
      );
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

  const fetchLines = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/lines');
      const lines = await response.json();
      setData(lines);
      setFilteredData(lines);
      setPagination(prev => ({
        ...prev,
        total: lines.length
      }));
    } catch (error) {
      console.error('Error fetching lines:', error);
    } finally {
      setLoading(false);
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
      title: 'Telco',
      key: 'telco',
      render: (_, record) => {
        if (record.telco) {
          return record.telco.name;
        }
        return 'Sin telco';
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
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/lines/${record.id}`)} />
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
        <Title level={2} style={{ margin: 0 }}>Todas las líneas</Title>
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
    </div>
  );
}