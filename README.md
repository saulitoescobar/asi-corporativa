# ASI CORPORATIVA - Control de Líneas Corporativas Móviles

Sistema completo de gestión de líneas corporativas móviles con representantes legales y funcionalidades tipo DataTables.

## 🚀 Instalación y Configuración

### Prerequisitos
- **XAMPP** (MySQL puerto 3333)
- **Node.js 18+** y npm
- **Git** para control de versiones

### 🔄 Setup para Nuevo Equipo

#### 1. Clonar el Repositorio
```bash
# Clonar repositorio
git clone https://github.com/saulitoescobar/asi-corporativa.git
cd asi-corporativa
```

#### 2. Configurar Base de Datos (MySQL)
```sql
-- Abrir phpMyAdmin o MySQL Workbench
-- Crear base de datos
CREATE DATABASE asicorporativa;
```

#### 3. Configurar Backend
```bash
# Navegar al backend
cd backend

# Instalar dependencias
npm install

# Crear archivo de configuración
# Crear archivo .env en la carpeta backend/
```

**Archivo `backend/.env`:**
```env
DB_HOST=localhost
DB_PORT=3333
DB_USER=root
DB_PASSWORD=
DB_NAME=asicorporativa
PORT=3001
NODE_ENV=development
```

#### 4. Inicializar Base de Datos
```bash
# Desde la carpeta backend/
npx sequelize db:migrate
npx sequelize db:seed:all
```

#### 5. Configurar Frontend
```bash
# Abrir nueva terminal y navegar al frontend
cd frontend

# Instalar dependencias
npm install
```

#### 6. Iniciar Aplicación
```bash
# Terminal 1 - Backend (desde carpeta backend/)
npm start

# Terminal 2 - Frontend (desde carpeta frontend/)
npm start
```

### 🔧 Verificación de Instalación
- **Backend API**: http://localhost:3001/api/telcos
- **Frontend**: http://localhost:3000
- **Base de datos**: Verificar que existan tablas y datos de prueba

## 📋 Funcionalidades Implementadas

### 🎯 Módulos Principales
- ✅ **Usuarios** - Gestión de usuarios del sistema
- ✅ **Líneas** - Control de líneas móviles corporativas (Módulo Index)
- ✅ **Telcos** - Operadores con búsqueda tipo DataTables
- ✅ **Empresas** - Gestión completa de empresas cliente
- ✅ **Planes** - Planes de servicios móviles
- ✅ **Posiciones** - Cargos y posiciones empresariales
- ✅ **Asesores** - Personal de atención al cliente
- 🆕 **Representantes Legales** - Sistema completo de gestión legal

### ✨ Nueva Funcionalidad: Telcos con DataTables
- **🔍 Búsqueda Global**: Campo de búsqueda que filtra en todos los campos
- **� Filtros por Columna**: Búsquedas específicas por nombre, dirección, teléfono
- **🏷️ Tags de Filtros Activos**: Visualización clara de filtros aplicados
- **📊 Paginación Avanzada**: Control completo de registros por página
- **⚡ Búsqueda en Tiempo Real**: Filtros automáticos al escribir
- **🛠️ CRUD Completo**: Crear, editar y eliminar con modales
- **📱 Interfaz Responsive**: Optimizada para todos los dispositivos

### �🆕 Representantes Legales - Funcionalidades Avanzadas
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
- **Búsqueda**: Implementación tipo DataTables con filtros avanzados

## 📱 URLs del Sistema
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Telcos**: http://localhost:3001/api/telcos
- **Documentación API**: http://localhost:3001/api

## � Flujo de Trabajo en Git

### Para Desarrolladores Nuevos
```bash
# 1. Clonar y configurar
git clone https://github.com/saulitoescobar/asi-corporativa.git
cd asi-corporativa
git checkout main

# 2. Crear rama para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# 3. Realizar cambios y commits
git add .
git commit -m "feat: descripción de la funcionalidad"

# 4. Enviar a GitHub
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request en GitHub
```

### Comandos Git Útiles
```bash
# Verificar estado
git status

# Ver ramas
git branch -a

# Actualizar desde main
git pull origin main

# Resolver conflictos y continuar
git add .
git commit -m "resolve: conflictos resueltos"
```

## 🔧 Comandos de Desarrollo

### Desarrollo Local
```bash
# Reiniciar base de datos (CUIDADO: elimina datos)
npx sequelize db:drop
npx sequelize db:create
npx sequelize db:migrate
npx sequelize db:seed:all

# Verificar conexión DB
node backend/dbTest.js

# Logs de desarrollo (Frontend con recarga automática)
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

# Verificar migraciones aplicadas
npx sequelize db:migrate:status
```

### 🐛 Solución de Problemas Comunes

#### Error de Conexión a Base de Datos
```bash
# Verificar que MySQL esté ejecutándose en puerto 3333
netstat -ano | findstr :3333

# Verificar archivo .env
cat backend/.env
```

#### Error en Dependencias
```bash
# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### Error de Puerto Ocupado
```bash
# Windows - Liberar puerto 3001
netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F

# Liberar puerto 3000
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

## 🎨 Estructura del Proyecto
```
asi-corporativa/
├── backend/
│   ├── models/          # Modelos Sequelize
│   ├── routes/          # Rutas API
│   ├── migrations/      # Migraciones DB
│   ├── seeders/         # Datos de prueba
│   └── .env            # Configuración
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Páginas del sistema
│   │   └── App.js      # Configuración de rutas
└── README.md           # Este archivo
```

## 📝 Notas para Desarrolladores

### Convenciones de Código
- **Commits**: Usar conventional commits (feat:, fix:, docs:)
- **Ramas**: feature/nombre-funcionalidad, fix/nombre-error
- **Componentes**: PascalCase para componentes React
- **Variables**: camelCase para JavaScript

### APIs Principales
- `GET /api/telcos` - Lista con paginación y búsqueda
- `POST /api/telcos` - Crear nuevo telco
- `PUT /api/telcos/:id` - Actualizar telco
- `DELETE /api/telcos/:id` - Eliminar telco

### Estado Actual
- ✅ Módulo Telcos con DataTables completamente funcional
- ✅ Búsqueda global y por columnas
- ✅ Paginación avanzada
- ✅ CRUD completo con validaciones
- ✅ Interfaz responsive

---

📞 **Contacto**: Para dudas sobre el proyecto, revisar issues en GitHub o contactar al maintainer.