import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Row,
  Col,
  Spin,
  Alert,
  Typography,
  Tag,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const TelcoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [telco, setTelco] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar información del telco
  const fetchTelco = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/telcos/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTelco(data);
      } else {
        throw new Error('Error al cargar información del telco');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelco();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" />;
  }

  if (!telco) {
    return <Alert message="Telco no encontrado" type="warning" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/telcos')}
        >
          Volver a Telcos
        </Button>
      </Space>

      <Title level={2}>
        <UserOutlined style={{ marginRight: 8 }} />
        {telco.name}
      </Title>

      <Row gutter={[24, 24]}>
        {/* Información básica del telco */}
        <Col xs={24} lg={12}>
          <Card 
            title="Información del Telco" 
            bordered={false}
            style={{ height: '100%' }}
          >
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item 
                label={
                  <Space>
                    <UserOutlined />
                    <span>Nombre</span>
                  </Space>
                }
              >
                <strong>{telco.name}</strong>
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <Space>
                    <HomeOutlined />
                    <span>Dirección</span>
                  </Space>
                }
              >
                {telco.address || <em style={{ color: '#999' }}>No especificada</em>}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <Space>
                    <PhoneOutlined />
                    <span>Teléfono</span>
                  </Space>
                }
              >
                {telco.phone || <em style={{ color: '#999' }}>No especificado</em>}
              </Descriptions.Item>

              <Descriptions.Item 
                label={
                  <Space>
                    <span>ID del Telco</span>
                  </Space>
                }
              >
                <Tag color="blue">#{telco.id}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Información de asesores */}
        <Col xs={24} lg={12}>
          <Card 
            title="Asesores Asignados" 
            bordered={false}
            style={{ height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Asesor de Ventas */}
              <div>
                <Title level={5} style={{ marginBottom: 12, color: '#52c41a' }}>
                  <UserOutlined style={{ marginRight: 8 }} />
                  Asesor de Ventas
                </Title>
                {telco.salesAdvisor ? (
                  <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Nombre">
                        <strong>{telco.salesAdvisor.name}</strong>
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        <Space>
                          <MailOutlined />
                          {telco.salesAdvisor.email}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Teléfono">
                        <Space>
                          <PhoneOutlined />
                          {telco.salesAdvisor.phone || 'No especificado'}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tipo">
                        <Tag color="green">Ventas</Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                ) : (
                  <Card size="small" style={{ backgroundColor: '#fff2e8', border: '1px solid #ffbb96' }}>
                    <em style={{ color: '#999' }}>Sin asesor de ventas asignado</em>
                  </Card>
                )}
              </div>

              <Divider style={{ margin: '12px 0' }} />

              {/* Asesor Post-Venta */}
              <div>
                <Title level={5} style={{ marginBottom: 12, color: '#1890ff' }}>
                  <UserOutlined style={{ marginRight: 8 }} />
                  Asesor Post-Venta
                </Title>
                {telco.postSalesAdvisor ? (
                  <Card size="small" style={{ backgroundColor: '#f0f9ff', border: '1px solid #91caff' }}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Nombre">
                        <strong>{telco.postSalesAdvisor.name}</strong>
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        <Space>
                          <MailOutlined />
                          {telco.postSalesAdvisor.email}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Teléfono">
                        <Space>
                          <PhoneOutlined />
                          {telco.postSalesAdvisor.phone || 'No especificado'}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tipo">
                        <Tag color="blue">Post-Venta</Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                ) : (
                  <Card size="small" style={{ backgroundColor: '#fff2e8', border: '1px solid #ffbb96' }}>
                    <em style={{ color: '#999' }}>Sin asesor post-venta asignado</em>
                  </Card>
                )}
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Botones de acción */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card>
            <Space>
              <Button 
                type="primary" 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/telcos')}
              >
                Volver a la Lista
              </Button>
              <Button 
                type="default"
                onClick={() => {
                  // Aquí podrías abrir un modal de edición o navegar a una página de edición
                  // Por ahora, simplemente volvemos a la lista donde pueden usar el botón editar
                  navigate('/telcos');
                }}
              >
                Ir a Editar
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TelcoDetail;