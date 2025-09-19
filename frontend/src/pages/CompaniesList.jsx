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
  Radio,
  DatePicker,
  Divider,
  Checkbox,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

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
  
  // Estados para representantes legales
  const [legalRepresentatives, setLegalRepresentatives] = useState([]);
  const [repMode, setRepMode] = useState('existing'); // 'existing' o 'new'
  const [loadingReps, setLoadingReps] = useState(false);
  const [showRepSection, setShowRepSection] = useState(false); // Para controlar si mostrar sección al editar
  
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

  const handleCreate = () => {
    setEditingCompany(null);
    form.resetFields();
    setRepMode('existing');
    setShowRepSection(true);
    fetchLegalRepresentatives();
    setModalVisible(true);
  };

  // Hook para atajos de teclado
  useKeyboardShortcuts([
    { key: 'F2', callback: handleCreate }
  ]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchText]);

  const filterCompanies = () => {
    if (!searchText) {
      setFilteredCompanies(companies);
      setPagination(prev => ({
        ...prev,
        total: companies.length,
        current: 1
      }));
      return;
    }

    const filtered = companies.filter(company => {
      const searchLower = searchText.toLowerCase();
      return (
        company.name.toLowerCase().includes(searchLower) ||
        (company.nit && company.nit.toLowerCase().includes(searchLower)) ||
        (company.address && company.address.toLowerCase().includes(searchLower)) ||
        (company.phone && company.phone.toLowerCase().includes(searchLower))
      );
    });

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

  // Cargar representantes legales disponibles
  const fetchLegalRepresentatives = async () => {
    setLoadingReps(true);
    try {
      const response = await fetch('http://localhost:3001/api/legal-representatives');
      if (response.ok) {
        const data = await response.json();
        setLegalRepresentatives(data);
      } else {
        message.error('Error al cargar representantes legales');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Error de conexión');
    } finally {
      setLoadingReps(false);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    form.setFieldsValue({
      ...company,
      legalRepresentationValidity: company.legalRepresentationValidity ? dayjs(company.legalRepresentationValidity) : null
    });
    setRepMode('existing');
    setShowRepSection(false);
    fetchLegalRepresentatives();
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

      const companyData = await response.json();
      
      // Gestionar representante legal tanto para nueva empresa como para edición
      if ((values.legalRepresentativeId || repMode === 'new') && values.shouldUpdateRepresentative !== false) {
        console.log('Gestionando representante legal:', { 
          repMode, 
          legalRepresentativeId: values.legalRepresentativeId,
          isEditing: !!editingCompany 
        });
        
        try {
          const companyId = editingCompany ? editingCompany.id : companyData.id;
          console.log('Company ID para representante:', companyId);
          
          if (repMode === 'existing' && values.legalRepresentativeId) {
            // Crear período con representante existente - necesitamos obtener los datos del representante
            const selectedRep = legalRepresentatives.find(rep => rep.id === values.legalRepresentativeId);
            if (selectedRep) {
              const periodData = {
                firstName: selectedRep.firstName,
                lastName: selectedRep.lastName,
                cui: selectedRep.cui,
                birthDate: selectedRep.birthDate,
                profession: selectedRep.profession,
                email: selectedRep.email,
                phone: selectedRep.phone,
                address: selectedRep.address,
                companyId: companyId,
                startDate: new Date().toISOString().split('T')[0],
                isActive: true
              };

              const periodResponse = await fetch('http://localhost:3001/api/legal-representatives', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(periodData),
              });

              if (!periodResponse.ok) {
                const errorData = await periodResponse.json();
                console.error('Error al crear período de representación:', errorData);
                message.warning('Error al asignar representante legal: ' + errorData.error);
              } else {
                console.log('Período de representación creado exitosamente');
              }
            }
          } else if (repMode === 'new') {
            // Crear nuevo representante legal
            const newRepData = {
              firstName: values.repFirstName,
              lastName: values.repLastName,
              cui: values.repCui,
              profession: values.repProfession,
              email: values.repEmail,
              phone: values.repPhone,
              address: values.repAddress,
              birthDate: values.repBirthDate ? values.repBirthDate.format('YYYY-MM-DD') : null,
              companyId: companyId,
              startDate: new Date().toISOString().split('T')[0],
              isActive: true
            };

            const newRepResponse = await fetch('http://localhost:3001/api/legal-representatives', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newRepData),
            });

            if (!newRepResponse.ok) {
              const errorData = await newRepResponse.json();
              console.error('Error al crear representante legal:', errorData);
              message.warning('Error al crear representante legal: ' + errorData.error);
            } else {
              console.log('Nuevo representante legal creado exitosamente');
            }
          }
        } catch (repError) {
          console.warn('Error al gestionar representante legal:', repError);
          // No fallar toda la operación si hay error con el representante
        }
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
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'NIT',
      dataIndex: 'nit',
      key: 'nit',
      width: 120,
      render: (nit) => nit || 'No especificado',
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
        // Filtrar solo los períodos activos y extraer los representantes legales
        const activeReps = record.legalRepPeriods ? 
          record.legalRepPeriods
            .filter(period => period.isActive)
            .map(period => period.legalRepresentative) : [];
            
        if (activeReps && activeReps.length > 0) {
          return (
            <div>
              {activeReps.map((rep, index) => (
                <div key={rep.id} style={{ 
                  marginBottom: index < activeReps.length - 1 ? '6px' : '0',
                  padding: '4px 0',
                  borderBottom: index < activeReps.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>
                    {rep.firstName} {rep.lastName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {rep.profession}
                  </div>
                </div>
              ))}
              {activeReps.length > 1 && (
                <div style={{ 
                  fontSize: '11px', 
                  color: '#1890ff', 
                  marginTop: '4px',
                  fontWeight: 500
                }}>
                  {activeReps.length} representantes activos
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
          />
          <Button
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
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item>Empresas</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <Title level={2} style={{ margin: 0 }}>
          Lista de Empresas
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          title="Presiona F2 para crear nueva empresa"
        >
          Nueva Empresa (F2)
        </Button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div style={{ 
        marginBottom: '16px',
        background: '#fafafa',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #d9d9d9'
      }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Buscar empresas..."
              allowClear
              value={searchText}
              onChange={(e) => onSearch(e.target.value)}
              onSearch={onSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col>
            {appliedFilters.length > 0 && (
              <Space wrap>
                <Text strong>Filtros aplicados:</Text>
                {appliedFilters.includes('search') && (
                  <Tag
                    closable
                    color="blue"
                    onClose={() => clearFilter('search')}
                  >
                    Búsqueda: "{searchText}"
                  </Tag>
                )}
                {appliedFilters.length > 1 && (
                  <Button
                    size="small"
                    icon={<ClearOutlined />}
                    onClick={clearAllFilters}
                  >
                    Limpiar todo
                  </Button>
                )}
              </Space>
            )}
          </Col>
        </Row>
      </div>

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

          {/* Opción para agregar representante al editar empresa */}
          {editingCompany && !showRepSection && (
            <Form.Item>
              <Checkbox 
                checked={showRepSection}
                onChange={(e) => setShowRepSection(e.target.checked)}
              >
                Agregar nuevo representante legal a esta empresa
              </Checkbox>
            </Form.Item>
          )}

          {/* Sección de Representante Legal */}
          {(!editingCompany || showRepSection) && (
            <>
              <Divider>
                {editingCompany ? 'Agregar Nuevo Representante Legal' : 'Representante Legal'}
              </Divider>
              
              {editingCompany && (
                <Form.Item>
                  <Alert
                    message="Agregar representante legal"
                    description="Esta acción agregará un nuevo período de representación para la empresa. Los representantes actuales permanecerán en el historial."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                </Form.Item>
              )}
              
              <Form.Item
                name="representativeModeSelection"
                label={editingCompany ? "¿Cómo desea agregar el nuevo representante legal?" : "¿Cómo desea asignar el representante legal?"}
              >
                <Radio.Group 
                  value={repMode} 
                  onChange={(e) => setRepMode(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Radio value="existing">Seleccionar representante existente</Radio>
                  <Radio value="new">Crear nuevo representante</Radio>
                </Radio.Group>
              </Form.Item>

              {repMode === 'existing' && (
                <Form.Item
                  name="legalRepresentativeId"
                  label="Representante Legal"
                  rules={editingCompany ? [] : [
                    { required: true, message: 'Seleccione un representante legal' }
                  ]}
                >
                  <Select
                    placeholder="Seleccione un representante legal"
                    loading={loadingReps}
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {legalRepresentatives.map(rep => (
                      <Option key={rep.id} value={rep.id}>
                        {rep.firstName} {rep.lastName} - {rep.profession}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              {repMode === 'new' && (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="repFirstName"
                        label="Nombres"
                        rules={editingCompany ? [] : [
                          { required: true, message: 'Los nombres son requeridos' }
                        ]}
                      >
                        <Input placeholder="Nombres del representante" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="repLastName"
                        label="Apellidos"
                        rules={editingCompany ? [] : [
                          { required: true, message: 'Los apellidos son requeridos' }
                        ]}
                      >
                        <Input placeholder="Apellidos del representante" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="repCui"
                        label="CUI"
                        rules={editingCompany ? [
                          { len: 13, message: 'El CUI debe tener 13 dígitos' }
                        ] : [
                          { required: true, message: 'El CUI es requerido' },
                          { len: 13, message: 'El CUI debe tener 13 dígitos' }
                        ]}
                      >
                        <Input placeholder="1234567890123" maxLength={13} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="repBirthDate"
                        label="Fecha de Nacimiento"
                      >
                        <DatePicker 
                          style={{ width: '100%' }}
                          placeholder="Seleccione la fecha"
                          format="DD/MM/YYYY"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="repProfession"
                    label="Profesión"
                    rules={editingCompany ? [] : [
                      { required: true, message: 'La profesión es requerida' }
                    ]}
                  >
                    <Input placeholder="Profesión del representante" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="repEmail"
                        label="Email"
                        rules={[
                          { type: 'email', message: 'Email no válido' }
                        ]}
                      >
                        <Input placeholder="email@ejemplo.com" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="repPhone"
                        label="Teléfono"
                      >
                        <Input placeholder="Teléfono del representante" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="repAddress"
                    label="Dirección"
                  >
                    <TextArea 
                      rows={2} 
                      placeholder="Dirección del representante" 
                    />
                  </Form.Item>
                </>
              )}
            </>
          )}

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