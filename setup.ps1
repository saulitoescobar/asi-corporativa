# ASI Corporativa - Script de Setup para Windows PowerShell
# =========================================================

Write-Host "🚀 ASI Corporativa - Script de Setup Automático" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Función para mostrar mensajes de error
function Write-Error-Message {
    param([string]$Message)
    Write-Host "❌ Error: $Message" -ForegroundColor Red
}

# Función para mostrar mensajes de éxito
function Write-Success-Message {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

# Función para mostrar información
function Write-Info-Message {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Función para mostrar advertencias
function Write-Warning-Message {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

Write-Info-Message "Iniciando setup de ASI Corporativa..."
Write-Host ""

# Verificar si existe MySQL
try {
    $mysqlVersion = mysql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success-Message "MySQL encontrado"
    } else {
        throw "MySQL no encontrado"
    }
} catch {
    Write-Error-Message "MySQL no está instalado o no está en PATH"
    Write-Host "Por favor instala MySQL 8.0+ antes de continuar"
    exit 1
}

# Verificar si existe Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success-Message "Node.js encontrado ($nodeVersion)"
    } else {
        throw "Node.js no encontrado"
    }
} catch {
    Write-Error-Message "Node.js no está instalado"
    Write-Host "Por favor instala Node.js antes de continuar"
    exit 1
}

# Verificar si existe npm
try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success-Message "npm encontrado ($npmVersion)"
    } else {
        throw "npm no encontrado"
    }
} catch {
    Write-Error-Message "npm no está instalado"
    exit 1
}

Write-Host ""
Write-Info-Message "Configurando base de datos..."

# Solicitar credenciales de MySQL
$DB_HOST = Read-Host "Host de MySQL (default: localhost)"
if ([string]::IsNullOrEmpty($DB_HOST)) { $DB_HOST = "localhost" }

$DB_PORT = Read-Host "Puerto de MySQL (default: 3307)"
if ([string]::IsNullOrEmpty($DB_PORT)) { $DB_PORT = "3307" }

$DB_USER = Read-Host "Usuario de MySQL (default: root)"
if ([string]::IsNullOrEmpty($DB_USER)) { $DB_USER = "root" }

$DB_PASSWORD = Read-Host "Contraseña de MySQL" -AsSecureString
$DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))

$DB_NAME = Read-Host "Nombre de la base de datos (default: asicorporativa)"
if ([string]::IsNullOrEmpty($DB_NAME)) { $DB_NAME = "asicorporativa" }

# Crear base de datos
Write-Info-Message "Creando base de datos '$DB_NAME'..."
$createDbQuery = "CREATE DATABASE IF NOT EXISTS ``$DB_NAME`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

try {
    mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -e $createDbQuery 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success-Message "Base de datos creada/verificada"
    } else {
        throw "Error creando base de datos"
    }
} catch {
    Write-Error-Message "No se pudo crear la base de datos"
    exit 1
}

# Importar datos
if (Test-Path "asi_corporativa_complete_export.sql") {
    Write-Info-Message "Importando datos desde asi_corporativa_complete_export.sql..."
    
    try {
        Get-Content "asi_corporativa_complete_export.sql" | mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success-Message "Datos importados correctamente"
        } else {
            throw "Error importando datos"
        }
    } catch {
        Write-Error-Message "Error al importar datos"
        exit 1
    }
} else {
    Write-Warning-Message "No se encontró asi_corporativa_complete_export.sql"
    Write-Info-Message "Ejecuta el script de export primero o copia el archivo SQL"
}

Write-Host ""
Write-Info-Message "Configurando backend..."

# Crear directorio backend si no existe
if (!(Test-Path "backend")) {
    New-Item -ItemType Directory -Path "backend"
}

# Crear archivo .env para backend
$envContent = @"
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
"@

$envContent | Out-File -FilePath "backend\.env" -Encoding UTF8
Write-Success-Message "Archivo .env creado para backend"

# Instalar dependencias del backend
if (Test-Path "backend\package.json") {
    Write-Info-Message "Instalando dependencias del backend..."
    Push-Location "backend"
    
    try {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Success-Message "Dependencias del backend instaladas"
        } else {
            throw "Error instalando dependencias"
        }
    } catch {
        Write-Error-Message "Error instalando dependencias del backend"
        Pop-Location
        exit 1
    }
    
    Pop-Location
} else {
    Write-Warning-Message "No se encontró package.json en backend\"
}

Write-Host ""
Write-Info-Message "Configurando frontend..."

# Instalar dependencias del frontend
if (Test-Path "frontend\package.json") {
    Write-Info-Message "Instalando dependencias del frontend..."
    Push-Location "frontend"
    
    try {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Success-Message "Dependencias del frontend instaladas"
        } else {
            throw "Error instalando dependencias"
        }
    } catch {
        Write-Error-Message "Error instalando dependencias del frontend"
        Pop-Location
        exit 1
    }
    
    Pop-Location
} else {
    Write-Warning-Message "No se encontró package.json en frontend\"
}

Write-Host ""
Write-Success-Message "🎉 Setup completado exitosamente!"
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🚀 COMANDOS PARA INICIAR LA APLICACIÓN" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend (PowerShell 1):" -ForegroundColor Blue
Write-Host "cd backend; npm start"
Write-Host ""
Write-Host "Frontend (PowerShell 2):" -ForegroundColor Blue
Write-Host "cd frontend; npm start"
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📊 INFORMACIÓN DE LA APLICACIÓN" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:3000"
Write-Host "🔧 Backend:  http://localhost:3001"
Write-Host "🗄️  Base de datos: $DB_HOST`:$DB_PORT/$DB_NAME"
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "👥 DATOS DE PRUEBA INCLUIDOS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "• 2 Empresas"
Write-Host "• 3 Usuarios"
Write-Host "• 5 Posiciones"
Write-Host "• 2 Asesores"
Write-Host "• 2 Telcos"
Write-Host "• 2 Planes"
Write-Host "• 2 Representantes Legales"
Write-Host ""
Write-Host "✨ ¡Disfruta usando ASI Corporativa!" -ForegroundColor Magenta