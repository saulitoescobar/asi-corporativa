import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Spin, 
  Alert,
  List,
  Avatar,
  Breadcrumb,
  Progress
} from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ShopOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLines: 0,
    activeLines: 0,
    totalCompanies: 0,
    monthlyExpense: 0,
    upcomingRenewals: [],
    expiredLines: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch de todas las APIs en paralelo
      const [usersRes, linesRes, companiesRes, plansRes] = await Promise.all([
        fetch('http://localhost:3001/api/users'),
        fetch('http://localhost:3001/api/lines'),
        fetch('http://localhost:3001/api/companies'),
        fetch('http://localhost:3001/api/plans')
      ]);

      const [users, lines, companies, plans] = await Promise.all([
        usersRes.json(),
        linesRes.json(),
        companiesRes.json(),
        plansRes.json()
      ]);

      // Calcular gasto mensual
      const activeLines = lines.filter(line => line.status === 'ACTIVE');
      const monthlyExpense = activeLines.reduce((total, line) => {
        if (line.plan && line.plan.cost) {
          return total + parseFloat(line.plan.cost);
        }
        return total;
      }, 0);

      // Líneas próximas a renovar (próximos 90 días)
      const today = dayjs();
      const upcomingRenewals = lines
        .filter(line => {
          if (!line.renewalDate) return false;
          const renewalDate = dayjs(line.renewalDate);
          const daysUntilRenewal = renewalDate.diff(today, 'days');
          return daysUntilRenewal >= 0 && daysUntilRenewal <= 90;
        })
        .sort((a, b) => dayjs(a.renewalDate).diff(dayjs(b.renewalDate)))
        .slice(0, 10); // Mostrar solo las 10 más próximas

      // Líneas vencidas (fechas de renovación pasadas)
      const expiredLines = lines
        .filter(line => {
          if (!line.renewalDate) return false;
          const renewalDate = dayjs(line.renewalDate);
          const daysUntilRenewal = renewalDate.diff(today, 'days');
          return daysUntilRenewal < 0; // Fechas en el pasado
        })
        .sort((a, b) => dayjs(b.renewalDate).diff(dayjs(a.renewalDate))) // Más recientes primero
        .slice(0, 10); // Mostrar solo las 10 más críticas

      setStats({
        totalUsers: users.length,
        totalLines: lines.length,
        activeLines: activeLines.length,
        totalCompanies: companies.length,
        monthlyExpense: monthlyExpense,
        upcomingRenewals: upcomingRenewals,
        expiredLines: expiredLines
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Columnas para la tabla de renovaciones próximas
  const renewalColumns = [
    {
      title: 'Línea',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      render: (lineNumber) => (
        <Text strong>{lineNumber}</Text>
      )
    },
    {
      title: 'Usuario',
      key: 'user',
      render: (_, record) => {
        if (record.user) {
          return `${record.user.firstName} ${record.user.lastName}`;
        }
        return 'No asignado';
      }
    },
    {
      title: 'Plan',
      key: 'plan',
      render: (_, record) => {
        if (record.plan) {
          return `${record.plan.planName} - Q${record.plan.cost}`;
        }
        return 'Sin plan';
      }
    },
    {
      title: 'Fecha de Renovación',
      dataIndex: 'renewalDate',
      key: 'renewalDate',
      render: (date) => {
        const renewalDate = dayjs(date);
        const today = dayjs();
        const daysUntilRenewal = renewalDate.diff(today, 'days');
        
        let color = 'green';
        if (daysUntilRenewal <= 15) color = 'red';
        else if (daysUntilRenewal <= 30) color = 'orange';
        
        return (
          <Tag color={color}>
            {renewalDate.format('DD/MM/YYYY')}
            <br />
            <small>({daysUntilRenewal} días)</small>
          </Tag>
        );
      }
    }
  ];

  // Columnas para la tabla de líneas vencidas
  const expiredColumns = [
    {
      title: 'Línea',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      render: (lineNumber) => (
        <Text strong style={{ color: '#ff4d4f' }}>{lineNumber}</Text>
      )
    },
    {
      title: 'Usuario',
      key: 'user',
      render: (_, record) => {
        if (record.user) {
          return `${record.user.firstName} ${record.user.lastName}`;
        }
        return 'No asignado';
      }
    },
    {
      title: 'Plan',
      key: 'plan',
      render: (_, record) => {
        if (record.plan) {
          return `${record.plan.planName} - Q${record.plan.cost}`;
        }
        return 'Sin plan';
      }
    },
    {
      title: 'Fecha de Vencimiento',
      dataIndex: 'renewalDate',
      key: 'renewalDate',
      render: (date) => {
        const renewalDate = dayjs(date);
        const today = dayjs();
        const daysOverdue = today.diff(renewalDate, 'days');
        
        return (
          <Tag color="red">
            {renewalDate.format('DD/MM/YYYY')}
            <br />
            <small>({daysOverdue} días vencida)</small>
          </Tag>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Cargando estadísticas...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} style={{ marginBottom: 24 }}>
        Dashboard - ASI Corporativa
      </Title>

      {/* Estadísticas principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Usuarios"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Líneas"
              value={stats.totalLines}
              prefix={<PhoneOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={
                <div style={{ fontSize: '12px', lineHeight: '1.2' }}>
                  <Text type="secondary" style={{ display: 'block' }}>
                    {stats.activeLines} activas
                  </Text>
                  {stats.expiredLines.length > 0 && (
                    <Text style={{ color: '#ff4d4f', fontWeight: 'bold', display: 'block' }}>
                      {stats.expiredLines.length} vencidas
                    </Text>
                  )}
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Empresas"
              value={stats.totalCompanies}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Gasto Mensual"
              value={stats.monthlyExpense}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="GTQ"
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alertas y Renovaciones */}
      <Row gutter={[16, 16]}>
        {/* Alerta de líneas vencidas */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <span>
                <WarningOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                Líneas Vencidas
              </span>
            }
            extra={
              <Tag color={stats.expiredLines.length > 0 ? 'red' : 'green'}>
                {stats.expiredLines.length} líneas
              </Tag>
            }
          >
            {stats.expiredLines.length > 0 ? (
              <List
                size="small"
                dataSource={stats.expiredLines.slice(0, 5)}
                renderItem={(item) => {
                  const daysOverdue = dayjs().diff(dayjs(item.renewalDate), 'days');
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={<WarningOutlined />} 
                            size="small"
                            style={{ backgroundColor: '#ff4d4f' }}
                          />
                        }
                        title={<Text style={{ color: '#ff4d4f' }}>{item.lineNumber}</Text>}
                        description={
                          <div>
                            <Text type="secondary">
                              {item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Sin usuario'}
                            </Text>
                            <br />
                            <Text strong style={{ color: '#ff4d4f' }}>
                              {daysOverdue} días vencida
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                <div>No hay líneas vencidas</div>
                <Text type="secondary">Todas las renovaciones están al día</Text>
              </div>
            )}
            {stats.expiredLines.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Text type="secondary">
                  +{stats.expiredLines.length - 5} líneas más
                </Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Alerta de renovaciones próximas */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Renovaciones Próximas
              </span>
            }
            extra={
              <Tag color={stats.upcomingRenewals.length > 0 ? 'orange' : 'green'}>
                {stats.upcomingRenewals.length} líneas
              </Tag>
            }
          >
            {stats.upcomingRenewals.length > 0 ? (
              <List
                size="small"
                dataSource={stats.upcomingRenewals.slice(0, 5)}
                renderItem={(item) => {
                  const daysUntilRenewal = dayjs(item.renewalDate).diff(dayjs(), 'days');
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={<PhoneOutlined />} 
                            size="small"
                            style={{ 
                              backgroundColor: daysUntilRenewal <= 15 ? '#ff4d4f' : '#faad14' 
                            }}
                          />
                        }
                        title={item.lineNumber}
                        description={
                          <div>
                            <Text type="secondary">
                              {item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Sin usuario'}
                            </Text>
                            <br />
                            <Text strong style={{ color: daysUntilRenewal <= 15 ? '#ff4d4f' : '#faad14' }}>
                              {daysUntilRenewal} días
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                <div>No hay renovaciones próximas</div>
                <Text type="secondary">Todas las líneas están al día</Text>
              </div>
            )}
            {stats.upcomingRenewals.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Text type="secondary">
                  +{stats.upcomingRenewals.length - 5} líneas más
                </Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Estado de las líneas */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <span>
                <PhoneOutlined style={{ marginRight: 8 }} />
                Estado de Líneas
              </span>
            }
          >
            {/* Progreso de líneas vencidas - más crítico, se muestra primero */}
            {stats.expiredLines.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text style={{ color: '#ff4d4f', fontWeight: 'bold' }}>Líneas Vencidas (Crítico)</Text>
                <Progress 
                  percent={stats.totalLines > 0 ? Math.round((stats.expiredLines.length / stats.totalLines) * 100) : 0}
                  status="exception"
                  strokeColor="#ff4d4f"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{stats.expiredLines.length} vencidas</Text>
                  <Text type="secondary">{stats.totalLines - stats.expiredLines.length} al día</Text>
                </div>
              </div>
            )}
            
            <div style={{ marginBottom: 16 }}>
              <Text>Líneas Activas</Text>
              <Progress 
                percent={stats.totalLines > 0 ? Math.round((stats.activeLines / stats.totalLines) * 100) : 0}
                status="active"
                strokeColor="#52c41a"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>{stats.activeLines} activas</Text>
                <Text style={{ color: '#fa8c16', fontWeight: 'bold' }}>{stats.totalLines - stats.activeLines} inactivas</Text>
              </div>
            </div>
            
            <div>
              <Text>Próximas a Renovar (90 días)</Text>
              <Progress 
                percent={stats.totalLines > 0 ? Math.round((stats.upcomingRenewals.length / stats.totalLines) * 100) : 0}
                strokeColor="#faad14"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <Text type="secondary">{stats.upcomingRenewals.length} líneas</Text>
                <Text type="secondary">{stats.totalLines - stats.upcomingRenewals.length} al día</Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Resumen de costos */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <span>
                <DollarOutlined style={{ marginRight: 8 }} />
                Resumen de Costos
              </span>
            }
          >
            <div style={{ marginBottom: 16 }}>
              <Statistic
                title="Gasto Mensual Total"
                value={stats.monthlyExpense}
                precision={2}
                suffix="GTQ"
                valueStyle={{ fontSize: '24px', color: '#fa541c' }}
              />
            </div>
            
            <div style={{ marginBottom: 8 }}>
              <Text>Proyección Anual:</Text>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fa541c' }}>
                Q{(stats.monthlyExpense * 12).toFixed(2)}
              </div>
            </div>
            
            <div>
              <Text>Costo promedio por línea:</Text>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                Q{stats.activeLines > 0 ? (stats.monthlyExpense / stats.activeLines).toFixed(2) : '0.00'}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabla detallada de líneas vencidas */}
      {stats.expiredLines.length > 0 && (
        <Card 
          title={
            <span>
              <WarningOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
              Líneas Vencidas - Acción Requerida
            </span>
          }
          style={{ marginTop: 16 }}
        >
          <Table
            columns={expiredColumns}
            dataSource={stats.expiredLines}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      )}

      {/* Tabla detallada de renovaciones próximas */}
      {stats.upcomingRenewals.length > 0 && (
        <Card 
          title={
            <span>
              <ClockCircleOutlined style={{ marginRight: 8, color: '#faad14' }} />
              Detalle de Renovaciones Próximas (90 días)
            </span>
          }
          style={{ marginTop: 16 }}
        >
          <Table
            columns={renewalColumns}
            dataSource={stats.upcomingRenewals}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      )}
    </div>
  );
}
