import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

export default function Dashboard() {
  return (
    <div>
      <Title level={2}>Visión General</Title>
      {/* Aquí va contenido del dashboard */}
    </div>
  );
}
