import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Alert,
  Button,
  Space,
  Tag,
  Divider,
  Avatar,
  Descriptions
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  BankOutlined,
  TeamOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/users/${id}`);
      
      if (!response.ok) {
        throw new Error('Usuario no encontrado');
      }
      
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
        />
        <Button 
          type="primary" 
          onClick={() => navigate('/usuarios')}
          style={{ marginTop: 16 }}
        >
          Volver a usuarios
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert 
          message="Usuario no encontrado" 
          type="warning" 
          showIcon 
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/usuarios')}
            >
              Volver
            </Button>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              <UserOutlined /> Detalle del Usuario
            </Title>
          </Space>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/usuarios/editar/${user.id}`)}
          >
            Editar Usuario
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Información Personal */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <Avatar 
                  size={32} 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#1890ff' }}
                />
                <span>Información Personal</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <Descriptions column={1} labelStyle={{ fontWeight: 'bold', color: '#666' }}>
              <Descriptions.Item label="CUI">
                <Tag color="purple" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {user.cui}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Nombre Completo">
                <Text strong style={{ fontSize: '16px' }}>
                  {user.firstName} {user.lastName}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Nombre">
                <Tag color="blue" style={{ fontSize: '13px' }}>
                  {user.firstName}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Apellido">
                <Tag color="cyan" style={{ fontSize: '13px' }}>
                  {user.lastName}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Fecha de Ingreso">
                <Space>
                  <CalendarOutlined style={{ color: '#1890ff' }} />
                  <Tag color="orange" style={{ fontSize: '13px' }}>
                    {user.joinDate ? dayjs(user.joinDate).format('DD/MM/YYYY') : 'No definida'}
                  </Tag>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Información Laboral */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <BankOutlined style={{ color: '#52c41a' }} />
                <span>Información Laboral</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <Descriptions column={1} labelStyle={{ fontWeight: 'bold', color: '#666' }}>
              <Descriptions.Item label="Empresa">
                {user.company ? (
                  <Space direction="vertical" size={4}>
                    <Tag color="green" style={{ fontSize: '14px', padding: '6px 12px' }}>
                      <BankOutlined /> {user.company.name}
                    </Tag>
                    {user.company.address && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        📍 {user.company.address}
                      </Text>
                    )}
                    {user.company.phone && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        📞 {user.company.phone}
                      </Text>
                    )}
                  </Space>
                ) : (
                  <Tag color="default">Sin empresa asignada</Tag>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Posición">
                {user.position ? (
                  <Tag color="orange" style={{ fontSize: '14px', padding: '6px 12px' }}>
                    <TeamOutlined /> {user.position.name}
                  </Tag>
                ) : (
                  <Tag color="default">Sin posición asignada</Tag>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="ID de Usuario">
                <Tag color="default" style={{ fontFamily: 'monospace' }}>
                  #{user.id}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Información Adicional */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <CalendarOutlined style={{ color: '#fa8c16' }} />
                <span>Información de Tiempo</span>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                  <div style={{ textAlign: 'center' }}>
                    <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Fecha de Ingreso</Text>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                        {user.joinDate ? dayjs(user.joinDate).format('DD/MM/YYYY') : 'No definida'}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card size="small" style={{ backgroundColor: '#f0f5ff', border: '1px solid #adc6ff' }}>
                  <div style={{ textAlign: 'center' }}>
                    <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Tiempo en la empresa</Text>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                        {user.joinDate ? 
                          dayjs().diff(dayjs(user.joinDate), 'days') + ' días' : 
                          'No calculable'
                        }
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card size="small" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
                  <div style={{ textAlign: 'center' }}>
                    <UserOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Estado</Text>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fa8c16' }}>
                        Activo
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserDetail;