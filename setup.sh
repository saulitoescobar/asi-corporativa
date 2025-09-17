#!/bin/bash

echo "🚀 ASI Corporativa - Script de Setup Automático"
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar errores
error() {
    echo -e "${RED}❌ Error: $1${NC}"
}

# Función para mostrar éxito
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para mostrar información
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Función para mostrar advertencias
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo ""
info "Iniciando setup de ASI Corporativa..."
echo ""

# Verificar si existe MySQL
if ! command -v mysql &> /dev/null; then
    error "MySQL no está instalado o no está en PATH"
    echo "Por favor instala MySQL 8.0+ antes de continuar"
    exit 1
fi

success "MySQL encontrado"

# Verificar si existe Node.js
if ! command -v node &> /dev/null; then
    error "Node.js no está instalado"
    echo "Por favor instala Node.js antes de continuar"
    exit 1
fi

success "Node.js encontrado ($(node --version))"

# Verificar si existe npm
if ! command -v npm &> /dev/null; then
    error "npm no está instalado"
    exit 1
fi

success "npm encontrado ($(npm --version))"

echo ""
info "Configurando base de datos..."

# Solicitar credenciales de MySQL
read -p "Host de MySQL (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Puerto de MySQL (default: 3307): " DB_PORT
DB_PORT=${DB_PORT:-3307}

read -p "Usuario de MySQL (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "Contraseña de MySQL: " DB_PASSWORD
echo ""

read -p "Nombre de la base de datos (default: asicorporativa): " DB_NAME
DB_NAME=${DB_NAME:-asicorporativa}

# Crear base de datos
info "Creando base de datos '$DB_NAME'..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null

if [ $? -eq 0 ]; then
    success "Base de datos creada/verificada"
else
    error "No se pudo crear la base de datos"
    exit 1
fi

# Importar datos
if [ -f "asi_corporativa_complete_export.sql" ]; then
    info "Importando datos desde asi_corporativa_complete_export.sql..."
    mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < asi_corporativa_complete_export.sql 2>/dev/null
    
    if [ $? -eq 0 ]; then
        success "Datos importados correctamente"
    else
        error "Error al importar datos"
        exit 1
    fi
else
    warning "No se encontró asi_corporativa_complete_export.sql"
    info "Ejecuta el script de export primero o copia el archivo SQL"
fi

echo ""
info "Configurando backend..."

# Crear directorio backend si no existe
mkdir -p backend

# Crear archivo .env para backend
cat > backend/.env << EOF
# Configuración de Base de Datos
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# Configuración del Servidor
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
EOF

success "Archivo .env creado para backend"

# Instalar dependencias del backend
if [ -f "backend/package.json" ]; then
    info "Instalando dependencias del backend..."
    cd backend
    npm install
    if [ $? -eq 0 ]; then
        success "Dependencias del backend instaladas"
    else
        error "Error instalando dependencias del backend"
        exit 1
    fi
    cd ..
else
    warning "No se encontró package.json en backend/"
fi

echo ""
info "Configurando frontend..."

# Instalar dependencias del frontend
if [ -f "frontend/package.json" ]; then
    info "Instalando dependencias del frontend..."
    cd frontend
    npm install
    if [ $? -eq 0 ]; then
        success "Dependencias del frontend instaladas"
    else
        error "Error instalando dependencias del frontend"
        exit 1
    fi
    cd ..
else
    warning "No se encontró package.json en frontend/"
fi

echo ""
success "🎉 Setup completado exitosamente!"
echo ""
echo "================================================"
echo "🚀 COMANDOS PARA INICIAR LA APLICACIÓN"
echo "================================================"
echo ""
echo -e "${BLUE}Backend (Terminal 1):${NC}"
echo "cd backend && npm start"
echo ""
echo -e "${BLUE}Frontend (Terminal 2):${NC}"
echo "cd frontend && npm start"
echo ""
echo "================================================"
echo "📊 INFORMACIÓN DE LA APLICACIÓN"
echo "================================================"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001"
echo "🗄️  Base de datos: $DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "================================================"
echo "👥 DATOS DE PRUEBA INCLUIDOS"
echo "================================================"
echo ""
echo "• 2 Empresas"
echo "• 3 Usuarios"
echo "• 5 Posiciones"
echo "• 2 Asesores"
echo "• 2 Telcos"
echo "• 2 Planes"
echo "• 2 Representantes Legales"
echo ""
echo "✨ ¡Disfruta usando ASI Corporativa!"