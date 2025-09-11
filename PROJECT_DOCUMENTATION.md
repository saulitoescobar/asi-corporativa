# ASI CORPORATIVA - Control de Líneas Corporativas Móviles

## 📋 RESUMEN DEL PROYECTO

**ASI CORPORATIVA** es un sistema web completo para la gestión y control de líneas telefónicas móviles corporativas. Permite administrar usuarios, empresas, planes, telcos, asesores y líneas telefónicas con sus respectivas relaciones y estados.

## 🏗️ ARQUITECTURA DEL SISTEMA

### **Stack Tecnológico:**
- **Frontend**: React 19.1.1 + Ant Design 5.27.3 + React Router 7.8.2
- **Backend**: Node.js + Express 5.1.0 + Sequelize 6.37.7 ORM
- **Base de Datos**: MySQL (puerto 3333 en XAMPP)
- **Herramientas**: dotenv, cors, nodemon

### **Estructura de Directorios:**
```
asicorporativa/
├── backend/
│   ├── config/
│   ├── migrations/
│   ├── models/
│   ├── routes/
│   ├── seeders/
│   ├── .env
│   ├── .sequelizerc
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── img/
│   │       └── logo_site.svg
│   ├── src/
│   │   ├── components/
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── UsersList.jsx
│   │   │   ├── LinesList.jsx
│   │   │   ├── TelcosList.jsx
│   │   │   ├── CompaniesList.jsx
│   │   │   ├── PlansList.jsx
│   │   │   ├── PositionsList.jsx
│   │   │   └── AdvisorsList.jsx
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🗄️ ESQUEMA DE BASE DE DATOS

### **Tablas y Relaciones:**

1. **companies** (Empresas)
   - id (PK), name

2. **positions** (Posiciones/Puestos)
   - id (PK), name

3. **users** (Usuarios/Empleados)
   - id (PK), cui, first_name, last_name, join_date
   - company_id (FK → companies), position_id (FK → positions)

4. **plans** (Planes Telefónicos)
   - id (PK), plan_name, minutes, megabytes, cost

5. **advisors** (Asesores)
   - id (PK), name, email, phone, type, telco_id (FK → telcos)

6. **telcos** (Operadoras Telefónicas)
   - id (PK), name, address, phone
   - sales_advisor_id (FK → advisors), post_sales_advisor_id (FK → advisors)

7. **lines** (Líneas Telefónicas)
   - id (PK), line_number, status
   - user_id (FK → users), plan_id (FK → plans), telco_id (FK → telcos)

### **Relaciones:**
- User belongs to Company and Position
- Line belongs to User, Plan, and Telco
- Telco has sales and post-sales Advisors
- Advisor belongs to Telco

## 🔧 CONFIGURACIÓN DEL ENTORNO

### **Variables de Entorno (backend/.env):**
```env
DB_HOST=localhost
DB_PORT=3333
DB_USER=root
DB_PASSWORD=
DB_NAME=asicorporativa
PORT=3001
```

### **Prerequisitos:**
- XAMPP con MySQL corriendo en puerto 3333
- Node.js y npm instalados
- Base de datos 'asicorporativa' creada en MySQL

## 🚀 COMANDOS DE INICIO

### **Backend:**
```bash
cd backend
npm install
npm start
# Servidor corriendo en http://localhost:3001
```

### **Frontend:**
```bash
cd frontend
npm install
npm start
# Aplicación corriendo en http://localhost:3000
```

### **Base de Datos:**
```bash
cd backend
npx sequelize db:migrate
npx sequelize db:seed:all
```

## 📡 ENDPOINTS API

### **Principales Rutas:**
- `GET /api/users` - Lista de usuarios con empresa y posición
- `GET /api/lines` - Lista de líneas con usuario, plan y telco
- `GET /api/telcos` - Lista de telcos con asesores
- `GET /api/companies` - Lista de empresas
- `GET /api/plans` - Lista de planes telefónicos
- `GET /api/positions` - Lista de posiciones
- `GET /api/advisors` - Lista de asesores

### **Estructura de Respuesta Ejemplo (Lines):**
```json
[
  {
    "id": 1,
    "lineNumber": "55-1234-5678",
    "status": "ACTIVE",
    "user": {
      "id": 1,
      "firstName": "Juan",
      "lastName": "Pérez",
      "company": {"name": "Empresa ABC"},
      "position": {"name": "Administrador"}
    },
    "plan": {
      "planName": "Plan Básico",
      "cost": "100.00"
    },
    "telco": {
      "name": "Telco A",
      "salesAdvisor": {"name": "Asesor Venta 1"}
    }
  }
]
```

## 🎨 COMPONENTES FRONTEND

### **MainLayout.jsx:**
- Layout principal con sidebar navegable
- Logo SVG "ASI CORPORATIVA" clickeable (navegación al home)
- Menú de 7 módulos con iconos Ant Design
- Sistema de routing con React Router

### **Páginas de Listado:**
Cada página sigue el mismo patrón:
- Estado de loading/error con componentes Ant Design
- Fetch de datos desde API
- Tabla con columnas específicas
- Paginación automática

### **Estructura de Componente Estándar:**
```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/endpoint');
    const data = await response.json();
    setData(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## 🔄 MODELOS SEQUELIZE

### **Asociaciones Configuradas:**
```javascript
// En models/index.js
db.User.belongsTo(db.Company, { foreignKey: 'company_id', as: 'company' });
db.User.belongsTo(db.Position, { foreignKey: 'position_id', as: 'position' });
db.Company.hasMany(db.User, { foreignKey: 'company_id', as: 'users' });
db.Position.hasMany(db.User, { foreignKey: 'position_id', as: 'users' });

db.Line.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.Line.belongsTo(db.Plan, { foreignKey: 'plan_id', as: 'plan' });
db.Line.belongsTo(db.Telco, { foreignKey: 'telco_id', as: 'telco' });
db.Plan.hasMany(db.Line, { foreignKey: 'plan_id', as: 'lines' });
db.Telco.hasMany(db.Line, { foreignKey: 'telco_id', as: 'lines' });

db.Telco.belongsTo(db.Advisor, { foreignKey: 'sales_advisor_id', as: 'salesAdvisor' });
db.Telco.belongsTo(db.Advisor, { foreignKey: 'post_sales_advisor_id', as: 'postSalesAdvisor' });
db.Advisor.hasMany(db.Telco, { foreignKey: 'sales_advisor_id', as: 'salesTelcos' });
db.Advisor.hasMany(db.Telco, { foreignKey: 'post_sales_advisor_id', as: 'postSalesTelcos' });
```

## 🎯 DATOS DE EJEMPLO

### **Empresas:** 6 empresas corporativas
### **Posiciones:** 7 puestos diferentes (Administrador, Operador, Gerente, etc.)
### **Usuarios:** 7 empleados distribuidos en empresas
### **Planes:** 5 planes telefónicos (Básico, Premium, Empresarial, etc.)
### **Telcos:** 3 operadoras (Telco A, MoviTech, ConectaCorp)
### **Asesores:** 6 asesores (ventas y post-venta)
### **Líneas:** 7 líneas telefónicas con diferentes estados

## 🐛 RESOLUCIÓN DE PROBLEMAS COMUNES

### **Backend no inicia:**
1. Verificar que XAMPP/MySQL esté corriendo en puerto 3333
2. Confirmar variables de entorno en .env
3. Verificar que la base de datos 'asicorporativa' exista

### **Frontend muestra errores CORS:**
1. Verificar que backend esté corriendo en puerto 3001
2. Confirmar que cors middleware esté configurado

### **APIs no cargan datos:**
1. Verificar conexión a base de datos
2. Ejecutar seeders: `npx sequelize db:seed:all`
3. Verificar logs del backend para errores SQL

### **Problema de directorio en PowerShell:**
- Usar `Set-Location` en lugar de `cd`
- Alternativamente usar rutas completas o Start-Process

## 📝 NOTAS TÉCNICAS

### **Campos de Base de Datos vs Modelo:**
- DB usa snake_case (first_name, plan_name)
- Modelos Sequelize usan camelCase (firstName, planName)
- Mapeo configurado con 'field' property

### **Estados de Líneas:**
- ACTIVE: Línea activa
- INACTIVE: Línea inactiva
- SUSPENDED: Línea suspendida

### **Tipos de Asesores:**
- SALE: Asesor de ventas
- POST_SALE: Asesor de post-venta

## 🚀 PRÓXIMAS MEJORAS SUGERIDAS

1. **CRUD Completo:** Añadir formularios de creación/edición
2. **Autenticación:** Sistema de login/logout
3. **Filtros:** Búsqueda y filtros en las tablas
4. **Dashboard:** Página inicial con estadísticas
5. **Validaciones:** Validación de formularios más robusta
6. **API REST Completa:** Métodos POST, PUT, DELETE
7. **Responsive:** Mejorar diseño móvil
8. **Tests:** Pruebas unitarias y de integración

## 🔐 SEGURIDAD

- CORS habilitado para desarrollo
- Variables de entorno para configuración sensible
- Validación básica en rutas API
- Error handling implementado

---

**Última actualización:** Septiembre 11, 2025
**Versión del Sistema:** 1.0.0
**Estado:** Funcional - Módulos de lectura completados