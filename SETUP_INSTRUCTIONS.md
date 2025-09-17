# Setup ASI Corporativa - Script de Instalación

Este archivo contiene todos los datos de la aplicación ASI Corporativa para poder replicarla en otros proyectos.

## 📋 Contenido del Export

### Estructura de Base de Datos:
- ✅ **9 tablas** exportadas con estructura completa
- ✅ **Relaciones FK** preservadas
- ✅ **Índices** y restricciones incluidas

### Datos Incluidos:

#### 🏢 **Companies (2 registros)**
- Sistemas Integrales de Seguridad, S. A. (NIT: 599191-9)
- Sistemas Globales de Seguridad, S. A. (NIT: 3564805-8)

#### 👥 **Users (3 registros)**
- Juan Saúl Escobar Gaitán (CUI: 2096757560613)
- María José Folgar Sandoval (CUI: 1234567890123)  
- Alfredo Jalal Pacay (CUI: 2234567890123)

#### 📋 **Positions (5 registros)**
- Gerente General
- Desarrollador Senior
- Analista de Sistemas
- Soporte Técnico
- Coordinador de Proyectos

#### 👨‍💼 **Advisors (2 registros)**
- Nimrod Gómez (Ventas)
- Nancy Rodriguez (Post-venta)

#### 📱 **Telcos (2 registros)**
- CLARO Guatemala
- TIGO Guatemala

#### 📦 **Plans (2 registros)**
- Ilimitado 20 GB (Q299.00)
- Ilimitado 30 GB (Q399.00)

#### ⚖️ **Legal Representatives (2 registros)**
- Henry Eduardo Méndez Sagastume
- Floriselda López Cruz

#### 📞 **Lines**
- Estructura preparada (sin datos)

## 🚀 Instrucciones de Instalación

### Prerrequisitos:
- MySQL 8.0+ 
- Puerto 3307 disponible (o modificar en config)
- Usuario root con contraseña root (o modificar credenciales)

### Pasos de Instalación:

1. **Crear base de datos:**
   ```bash
   mysql -u root -p -P 3307 -h localhost
   ```

2. **Ejecutar el script:**
   ```bash
   mysql -u root -p -P 3307 -h localhost < asi_corporativa_complete_export.sql
   ```

3. **Verificar instalación:**
   ```sql
   USE asicorporativa;
   SHOW TABLES;
   SELECT COUNT(*) as total_users FROM users;
   SELECT COUNT(*) as total_companies FROM companies;
   ```

## ⚙️ Configuración Backend

Crear archivo `.env` en el directorio backend:

```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=root
DB_NAME=asicorporativa
PORT=3001
```

## 📁 Estructura del Proyecto

```
proyecto/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── migrations/
│   ├── seeders/
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   └── package.json
└── asi_corporativa_complete_export.sql
```

## 🎯 Funcionalidades Incluidas

### Frontend React:
- ✅ CRUD completo para todas las entidades
- ✅ Búsqueda avanzada tipo DataTables
- ✅ Filtros por columna
- ✅ Paginación y ordenamiento
- ✅ Vista detalle para usuarios y telcos
- ✅ Atajos de teclado (F2 para crear)
- ✅ Interfaz responsiva con Ant Design

### Backend Express:
- ✅ API REST completa
- ✅ Validaciones de datos
- ✅ Relaciones entre entidades
- ✅ Manejo de errores
- ✅ Middleware de debugging

### Base de Datos:
- ✅ Esquema normalizado
- ✅ Claves foráneas configuradas
- ✅ Índices optimizados
- ✅ Restricciones de unicidad

## 🔧 Comandos de Desarrollo

### Backend:
```bash
cd backend
npm install
npm start
```

### Frontend:
```bash
cd frontend
npm install
npm start
```

## 📊 Estadísticas del Export

- **Archivo:** asi_corporativa_complete_export.sql
- **Tamaño:** 9.94 KB
- **Líneas:** 245
- **Tablas:** 9
- **Registros totales:** ~15 registros de datos reales

## 🎨 Módulos Disponibles

1. **Dashboard** - Página principal
2. **Usuarios** - Gestión de empleados
3. **Empresas** - Gestión de compañías
4. **Posiciones** - Cargos y puestos
5. **Telcos** - Operadoras telefónicas
6. **Asesores** - Representantes comerciales
7. **Planes** - Planes telefónicos
8. **Líneas** - Líneas telefónicas
9. **Representantes Legales** - Gestión legal

---

**Generado el:** 17/9/2025  
**Versión:** 1.0.0  
**Autor:** ASI Corporativa Team