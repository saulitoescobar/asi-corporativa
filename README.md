# ASI CORPORATIVA

Sistema de control de líneas corporativas móviles.

## 🚀 Instalación

### Prerequisitos
- XAMPP (MySQL puerto 3333)
- Node.js

### Setup
```bash
# Backend
cd backend
npm install
npx sequelize db:migrate
npx sequelize db:seed:all
npm start

# Frontend  
cd frontend
npm install
npm start
```

Configurar variables de entorno en `backend/.env` (ver documentación).

## Módulos
- Usuarios
- Líneas
- Telcos
- Empresas
- Planes
- Posiciones
- Asesores

React + Node.js + MySQL