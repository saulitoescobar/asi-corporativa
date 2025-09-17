# ASI Corporativa 🏢

Sistema de gestión empresarial integral con frontend en React y backend en Node.js. Incluye funcionalidades avanzadas de CRUD, búsqueda tipo DataTables, vistas detalle y atajos de teclado.

## 🚀 Características Principales

- ✅ **CRUD Completo** - Crear, leer, actualizar y eliminar en todas las entidades
- ✅ **Búsqueda Avanzada** - Filtros tipo DataTables con búsqueda en tiempo real
- ✅ **Vistas Detalle** - Páginas detalladas para usuarios y telcos
- ✅ **Atajos de Teclado** - Tecla F2 para crear nuevos registros
- ✅ **Interfaz Moderna** - Diseño responsivo con Ant Design
- ✅ **API REST** - Backend robusto con validaciones
- ✅ **Base de Datos** - MySQL con relaciones optimizadas
- ✅ **Setup Automático** - Scripts de instalación incluidos

## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework principal
- **Ant Design** - Librería de componentes UI
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP
- **React Hooks** - Estado y ciclo de vida

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Sequelize ORM** - Mapeo objeto-relacional
- **MySQL** - Base de datos relacional
- **mysql2** - Driver para MySQL

## 📁 Estructura del Proyecto

```
asi-corporativa/
├── 📂 frontend/                    # Aplicación React
│   ├── 📂 src/
│   │   ├── 📂 components/         # Componentes reutilizables
│   │   │   └── MainLayout.jsx     # Layout principal
│   │   ├── 📂 pages/              # Páginas principales
│   │   │   ├── Dashboard.jsx      # Página de inicio
│   │   │   ├── UsersList.jsx      # Lista de usuarios
│   │   │   ├── UserDetail.jsx     # Detalle de usuario
│   │   │   ├── CompaniesList.jsx  # Lista de empresas
│   │   │   ├── CompanyDetail.jsx  # Detalle de empresa
│   │   │   └── ...                # Otros módulos
│   │   ├── 📂 hooks/              # Custom hooks
│   │   │   └── useKeyboardShortcuts.js
│   │   └── 📂 img/                # Imágenes
│   └── package.json
├── 📂 backend/                     # API REST
│   ├── 📂 models/                 # Modelos Sequelize
│   │   ├── User.js                # Modelo de usuarios
│   │   ├── Company.js             # Modelo de empresas
│   │   └── ...                    # Otros modelos
│   ├── 📂 routes/                 # Rutas de la API
│   ├── 📂 config/                 # Configuración
│   ├── 📂 migrations/             # Migraciones de BD
│   ├── 📂 seeders/                # Datos semilla
│   └── package.json
├── 📄 asi_corporativa_complete_export.sql  # Export completo de BD
├── 📄 setup.sh                    # Script setup Linux/Mac
├── 📄 setup.ps1                   # Script setup Windows
├── 📄 SETUP_INSTRUCTIONS.md       # Instrucciones detalladas
└── 📄 README.md
```

## ⚡ Instalación Rápida

### Opción 1: Setup Automático (Recomendado)

**Para Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Para Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Opción 2: Instalación Manual

#### Prerrequisitos
- Node.js 16+
- MySQL 8.0+
- Puerto 3307 disponible

#### Pasos:

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd asi-corporativa
```

2. **Configurar base de datos**
```sql
CREATE DATABASE asicorporativa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **Importar datos**
```bash
mysql -u root -p -P 3307 asicorporativa < asi_corporativa_complete_export.sql
```

4. **Configurar backend**
```bash
cd backend
npm install
```

Crear archivo `.env`:
```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=root
DB_NAME=asicorporativa
PORT=3001
```

5. **Configurar frontend**
```bash
cd frontend
npm install
```

## 🚀 Ejecución

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **Base de Datos:** localhost:3307/asicorporativa

## 📊 Módulos Disponibles

| Módulo | Descripción | Registros Incluidos |
|--------|-------------|-------------------|
| 👥 **Usuarios** | Gestión de empleados | 3 usuarios |
| 🏢 **Empresas** | Gestión de compañías | 2 empresas |
| 📋 **Posiciones** | Cargos y puestos | 5 posiciones |
| 📱 **Telcos** | Operadoras telefónicas | 2 telcos |
| 👨‍💼 **Asesores** | Representantes comerciales | 2 asesores |
| 📦 **Planes** | Planes telefónicos | 2 planes |
| 📞 **Líneas** | Líneas telefónicas | Estructura lista |
| ⚖️ **Representantes** | Gestión legal | 2 representantes |

## ⌨️ Atajos de Teclado

- **F2** - Crear nuevo registro en cualquier módulo
- **Esc** - Cerrar modales
- **Enter** - Confirmar formularios

## 🎯 Funcionalidades Principales

### 🔍 Búsqueda Avanzada
- Búsqueda global en tiempo real
- Filtros por columna
- Paginación inteligente
- Ordenamiento por cualquier campo

### 👀 Vistas Detalle
- **UserDetail:** Información completa del usuario, empresa, posición
- **CompanyDetail:** Detalles de empresa, representantes legales
- **TelcoDetail:** Información de operadora, planes disponibles

### 📱 Interfaz Responsiva
- Diseño adaptable a móviles
- Tarjetas informativas con colores
- Navegación intuitiva
- Feedback visual en todas las acciones

## 📈 Datos de Prueba Incluidos

### 👥 Usuarios
- **Juan Saúl Escobar Gaitán** (CUI: 2096757560613)
- **María José Folgar Sandoval** (CUI: 1234567890123)
- **Alfredo Jalal Pacay** (CUI: 2234567890123)

### 🏢 Empresas
- **Sistemas Integrales de Seguridad, S. A.** (NIT: 599191-9)
- **Sistemas Globales de Seguridad, S. A.** (NIT: 3564805-8)

### 📋 Posiciones
- Gerente General
- Desarrollador Senior
- Analista de Sistemas
- Soporte Técnico
- Coordinador de Proyectos

### 📱 Telcos y Planes
- **CLARO Guatemala** - Ilimitado 20 GB (Q299.00)
- **TIGO Guatemala** - Ilimitado 30 GB (Q399.00)

## 🔧 API Endpoints

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Empresas
- `GET /api/companies` - Listar empresas
- `POST /api/companies` - Crear empresa
- `GET /api/companies/:id` - Obtener empresa
- `PUT /api/companies/:id` - Actualizar empresa
- `DELETE /api/companies/:id` - Eliminar empresa

*Similar estructura para todos los módulos*

## 🗄️ Estructura de Base de Datos

### Relaciones Principales
- `users` → `companies` (Muchos a Uno)
- `users` → `positions` (Muchos a Uno)
- `companies` → `legal_representatives` (Uno a Muchos)
- `lines` → `telcos` (Muchos a Uno)
- `lines` → `plans` (Muchos a Uno)
- `lines` → `advisors` (Muchos a Uno)

## 🛡️ Características Técnicas

### Seguridad
- Validación de datos en frontend y backend
- Sanitización de inputs
- Manejo de errores robusto

### Performance
- Paginación eficiente
- Índices optimizados
- Lazy loading de datos

### Mantenibilidad
- Código modular y reutilizable
- Comentarios y documentación
- Estructura escalable

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**ASI Corporativa Team**

---

**Versión:** 1.0.0  
**Última actualización:** 17/9/2025  
**Estado:** ✅ Estable y Funcional

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