# ASI CORPORATIVA - Control de Líneas Corporativas Móviles

Sistema completo de gestión de líneas corporativas móviles con representantes legales.

## 🚀 Instalación

### Prerequisitos
- XAMPP (MySQL puerto 3333)
- Node.js 16+

### Setup
```bash
# Clonar repositorio
git clone https://github.com/saulitoescobar/asi-corporativa.git
cd asi-corporativa

# Backend
cd backend
npm install
npx sequelize db:migrate
npx sequelize db:seed:all
npm start

# Frontend (nueva terminal)
cd frontend
npm install
npm start
```

### Configuración
Crear archivo `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3333
DB_USER=root
DB_PASSWORD=
DB_NAME=asicorporativa
PORT=3001
```

## 📋 Funcionalidades

### Módulos Principales
- ✅ **Usuarios** - Gestión de usuarios del sistema
- ✅ **Líneas** - Control de líneas móviles corporativas
- ✅ **Telcos** - Operadores de telecomunicaciones
- ✅ **Empresas** - Gestión completa de empresas cliente
- ✅ **Planes** - Planes de servicios móviles
- ✅ **Posiciones** - Cargos y posiciones empresariales
- ✅ **Asesores** - Personal de atención al cliente
- 🆕 **Representantes Legales** - Sistema completo de gestión legal

### 🆕 Representantes Legales - Funcionalidades Avanzadas
- **Múltiples representantes activos simultáneos** por empresa
- **Mismo representante en múltiples empresas** (caso real corporativo)
- **Gestión de períodos históricos** con validación de solapamientos
- **Vista detallada por empresa** con historial completo
- **CRUD completo** con interfaz intuitiva
- **Activación/desactivación independiente** de representantes

### 🔄 Casos de Uso Soportados
1. **Multi-empresa**: Juan Pérez puede ser representante de 3 empresas simultáneamente
2. **Multi-período**: Mismo representante con períodos no continuos (ej: 2012-2015, luego 2018-2022)
3. **Validación inteligente**: Previene solapamientos de fechas por empresa
4. **Flexibilidad corporativa**: Hasta N representantes activos por empresa

## 🛠️ Stack Tecnológico
- **Frontend**: React 19.1.1 + Ant Design 5.27.3
- **Backend**: Node.js + Express 5.1.0 + Sequelize 6.37.7
- **Base de Datos**: MySQL 8.0
- **Router**: React Router 7.8.2

## 📱 URLs del Sistema
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentación API**: http://localhost:3001/api

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Reiniciar base de datos (CUIDADO: elimina datos)
npx sequelize db:drop
npx sequelize db:create
npx sequelize db:migrate
npx sequelize db:seed:all

# Verificar conexión DB
node backend/dbTest.js

# Logs de desarrollo
npm run dev
```

### Base de Datos
```bash
# Nueva migración
npx sequelize migration:generate --name nombre-migracion

# Nueva semilla
npx sequelize seed:generate --name nombre-semilla

# Ejecutar migraciones específicas
npx sequelize db:migrate:up --to YYYYMMDDHHMMSS-nombre-migracion.js
```