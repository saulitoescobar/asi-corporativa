import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  GlobalOutlined,
  BankOutlined,
  CreditCardOutlined,
  TeamOutlined,
  ContactsOutlined,
  SolutionOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const items = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/users', icon: <UserOutlined />, label: 'Usuarios' },
  { key: '/lines', icon: <PhoneOutlined />, label: 'Líneas' },
  { key: '/telcos', icon: <GlobalOutlined />, label: 'Telcos' },
  { key: '/companies', icon: <BankOutlined />, label: 'Empresas' },
  { key: '/legal-representatives', icon: <SolutionOutlined />, label: 'Representantes Legales' },
  { key: '/plans', icon: <CreditCardOutlined />, label: 'Planes' },
  { key: '/positions', icon: <TeamOutlined />, label: 'Posiciones' },
  { key: '/advisors', icon: <ContactsOutlined />, label: 'Asesores' },
];

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determinar la clave seleccionada basada en la ruta actual
  let selectedKey = '/';
  if (location.pathname === '/' || location.pathname === '/dashboard') {
    selectedKey = '/';
  } else {
    const foundItem = items.find(i => i.key !== '/' && location.pathname.startsWith(i.key));
    selectedKey = foundItem?.key || '/';
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 64, margin: 16, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer', transition: 'opacity 0.3s' }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <img 
              src="/img/logo_site.svg" 
              alt="ASI Corporativa - Home" 
              style={{ maxHeight: '50px', maxWidth: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => navigate(key)}
          items={items}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0, textAlign: 'right', paddingRight: 24 }}>
          {/* Aquí podrían ir notificaciones, avatar, etc. */}
        </Header>
        <Content style={{ margin: '16px', background: '#fff', padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
