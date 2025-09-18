# 🏠 Instrucciones para Continuar el Trabajo desde Casa

## 📋 Estado Actual del Proyecto

✅ **COMPLETADO - Estandarización de Interfaz DataTables**
- Todos los módulos ahora tienen el mismo diseño y funcionalidad
- Breadcrumbs implementados en todos los módulos
- Buscador estandarizado con botón "Buscar" sin iconos
- Selector "10 por página" implementado
- Botón "Limpiar Filtros" estandarizado
- Contador "Mostrando X-Y de Z registros" implementado

## 🚀 Configuración Inicial en Casa

### 1. Clonar el repositorio
```bash
git clone https://github.com/saulitoescobar/asi-corporativa.git
cd asi-corporativa
```

### 2. Configurar Base de Datos MySQL
```sql
-- Crear la base de datos
CREATE DATABASE asicorporativa;

-- Crear usuario (opcional)
CREATE USER 'asi_user'@'localhost' IDENTIFIED BY 'asi_password';
GRANT ALL PRIVILEGES ON asicorporativa.* TO 'asi_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configurar variables de entorno del Backend
```bash
cd backend
cp .env.example .env
```

Editar el archivo `.env` con tus datos locales:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=asicorporativa
PORT=3001
```

### 4. Instalar dependencias del Backend
```bash
# En el directorio backend/
npm install
```

### 5. Ejecutar migraciones y seeders
```bash
# Crear las tablas
npx sequelize-cli db:migrate

# Cargar datos de prueba
npx sequelize-cli db:seed:all
```

### 6. Instalar dependencias del Frontend
```bash
cd ../frontend
npm install
```

## 🔧 Comandos para Ejecutar el Proyecto

### Terminal 1 - Backend
```bash
cd backend
node index.js
```
**Resultado esperado:** `Backend API listening on port 3001`

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```
**Resultado esperado:** Aplicación disponible en `http://localhost:3000`

## 📊 Módulos Disponibles

Todos los módulos están estandarizados y funcionando:

1. **Gestión de Usuarios** - `/users`
2. **Gestión de Telcos** - `/telcos`
3. **Gestión de Planes** - `/plans`
4. **Gestión de Posiciones** - `/positions`
5. **Gestión de Asesores** - `/advisors`
6. **Gestión de Empresas** - `/companies`
7. **Gestión de Representantes Legales** - `/legal-representatives`
8. **Lista de Líneas** - `/lines`

## 🎯 Próximas Tareas Sugeridas

### Prioridad Alta
1. **Formularios de Creación/Edición**
   - Estandarizar todos los formularios modales
   - Implementar validaciones consistentes
   - Agregar campos faltantes según requieran

2. **Funcionalidad de Filtros Avanzados**
   - Implementar filtros por columna en todos los módulos
   - Agregar filtros por fecha, rango, etc.
   - Mejorar la búsqueda global

3. **Gestión de Estados**
   - Implementar estados activo/inactivo consistentes
   - Agregar confirmaciones para acciones destructivas

### Prioridad Media
4. **Exportación de Datos**
   - Implementar exportación a Excel/PDF
   - Agregar opciones de exportación filtrada

5. **Paginación del Servidor**
   - Migrar de paginación local a paginación del servidor
   - Implementar lazy loading para tablas grandes

6. **Notificaciones y Feedback**
   - Mejorar mensajes de éxito/error
   - Implementar notificaciones toast consistentes

### Prioridad Baja
7. **Optimizaciones de Performance**
   - Implementar memoización en componentes
   - Optimizar queries de base de datos

8. **Funcionalidades Adicionales**
   - Dashboard con estadísticas
   - Reportes avanzados
   - Auditoría de cambios

## 🐛 Troubleshooting Común

### Error de Conexión a Base de Datos
```bash
# Verificar que MySQL esté corriendo
sudo service mysql status  # Linux
brew services list | grep mysql  # macOS
```

### Error de Puerto Ocupado
```bash
# Verificar qué está usando el puerto 3000 o 3001
netstat -ano | findstr :3000  # Windows
lsof -i :3000  # macOS/Linux
```

### Problemas de Compilación Frontend
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📝 Notas de Desarrollo

### Estructura de Componentes Estandarizada
```jsx
// Patrón implementado en todos los módulos
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={8}>
    <Search enterButton="Buscar" size="large" />
  </Col>
  <Col xs={24} sm={12} md={4}>
    <Select size="large">
      <Option value={10}>10 por página</Option>
    </Select>
  </Col>
  <Col xs={24} sm={12} md={4}>
    <Button icon={<ClearOutlined />}>Limpiar Filtros</Button>
  </Col>
  <Col xs={24} sm={12} md={8}>
    <Text>Mostrando X-Y de Z registros</Text>
  </Col>
</Row>
```

### APIs Disponibles
- GET `/api/users` - Lista de usuarios
- GET `/api/telcos` - Lista de telcos
- GET `/api/plans` - Lista de planes
- GET `/api/positions` - Lista de posiciones
- GET `/api/advisors` - Lista de asesores
- GET `/api/companies` - Lista de empresas
- GET `/api/legal-representatives` - Lista de rep. legales
- GET `/api/lines` - Lista de líneas

## 📞 Contacto y Soporte

Si encuentras algún problema o necesitas aclaraciones:
1. Revisa este documento
2. Consulta los logs del backend/frontend
3. Verifica la conexión a la base de datos
4. Comprueba que todos los servicios estén ejecutándose

---

**Último commit:** `658f1a5` - Estandarización completa de la interfaz DataTables
**Fecha:** Septiembre 17, 2025
**Estado:** ✅ Listo para desarrollo continuo desde casa