# ASI CORPORATIVA - Control de Líneas Corporativas Móviles

Sistema web completo para la gestión y control de líneas telefónicas móviles corporativas desarrollado con React + Node.js + MySQL.

## 🚀 Inicio Rápido

### Prerequisitos
- XAMPP con MySQL en puerto 3333
- Node.js y npm
- Base de datos 'asicorporativa' creada

### Instalación

1. **Backend:**
```bash
cd backend
npm install
npx sequelize db:migrate
npx sequelize db:seed:all
npm start
```

2. **Frontend:**
```bash
cd frontend
npm install
npm start
```

3. **Acceder:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📋 Módulos Incluidos

- 👥 **Usuarios** - Gestión de empleados corporativos
- 📞 **Líneas** - Control de líneas telefónicas móviles
- 🌐 **Telcos** - Administración de operadoras telefónicas
- 🏢 **Empresas** - Registro de empresas corporativas
- 💳 **Planes** - Catálogo de planes telefónicos
- 👔 **Posiciones** - Puestos de trabajo
- 📋 **Asesores** - Asesores de ventas y post-venta

## 🛠️ Stack Tecnológico

- **Frontend:** React 19.1.1 + Ant Design 5.27.3
- **Backend:** Node.js + Express 5.1.0 + Sequelize 6.37.7
- **Base de Datos:** MySQL
- **Otras:** React Router, dotenv, cors

## 📚 Documentación Completa

Ver [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) para:
- Arquitectura detallada del sistema
- Esquema completo de base de datos
- Guía de APIs y endpoints
- Resolución de problemas
- Configuración avanzada

## 🔧 Configuración

Crear archivo `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3333
DB_USER=root
DB_PASSWORD=
DB_NAME=asicorporativa
PORT=3001
```

## 📸 Características

- ✅ Interfaz moderna con Ant Design
- ✅ API REST completa
- ✅ Base de datos relacional
- ✅ Datos de ejemplo incluidos
- ✅ Navegación responsive
- ✅ Logo corporativo personalizado

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para nueva funcionalidad
3. Commit cambios
4. Push a la rama
5. Crear Pull Request

---

**Versión:** 1.0.0 | **Estado:** Funcional