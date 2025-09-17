const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'root',
  database: 'asicorporativa'
};

async function exportCompleteData() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    connection = await mysql.createConnection(config);
    
    // Obtener lista de todas las tablas
    const [tables] = await connection.execute("SHOW TABLES");
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    console.log('Tablas encontradas:', tableNames);
    
    let sqlContent = `-- Script de exportación completa de datos\n`;
    sqlContent += `-- Generado el: ${new Date().toLocaleString()}\n`;
    sqlContent += `-- Base de datos: asicorporativa\n\n`;
    
    sqlContent += `-- Crear base de datos si no existe\n`;
    sqlContent += `CREATE DATABASE IF NOT EXISTS asicorporativa;\n`;
    sqlContent += `USE asicorporativa;\n\n`;
    
    // Deshabilitar foreign key checks
    sqlContent += `-- Deshabilitar verificaciones de foreign key\n`;
    sqlContent += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;
    
    // Para cada tabla, obtener estructura y datos
    for (const tableName of tableNames) {
      console.log(`Procesando tabla: ${tableName}`);
      
      try {
        // Obtener estructura de la tabla
        const [createTableResult] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
        const createTableSQL = createTableResult[0]['Create Table'];
        
        sqlContent += `-- Estructura de tabla \`${tableName}\`\n`;
        sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
        sqlContent += `${createTableSQL};\n\n`;
        
        // Obtener datos de la tabla
        const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\``);
        
        if (rows.length > 0) {
          sqlContent += `-- Datos para la tabla \`${tableName}\`\n`;
          
          // Obtener nombres de columnas
          const [columns] = await connection.execute(`DESCRIBE \`${tableName}\``);
          const columnNames = columns.map(col => `\`${col.Field}\``).join(', ');
          
          sqlContent += `INSERT INTO \`${tableName}\` (${columnNames}) VALUES\n`;
          
          const values = rows.map(row => {
            const rowValues = Object.values(row).map(value => {
              if (value === null) return 'NULL';
              if (typeof value === 'string') {
                // Escapar comillas simples
                return `'${value.replace(/'/g, "''")}'`;
              }
              if (value instanceof Date) {
                return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
              }
              return value;
            });
            return `(${rowValues.join(', ')})`;
          });
          
          sqlContent += values.join(',\n');
          sqlContent += `;\n\n`;
        } else {
          sqlContent += `-- No hay datos en la tabla \`${tableName}\`\n\n`;
        }
        
      } catch (tableError) {
        console.warn(`Error procesando tabla ${tableName}:`, tableError.message);
        sqlContent += `-- Error al procesar tabla \`${tableName}\`: ${tableError.message}\n\n`;
      }
    }
    
    // Rehabilitar foreign key checks
    sqlContent += `-- Rehabilitar verificaciones de foreign key\n`;
    sqlContent += `SET FOREIGN_KEY_CHECKS = 1;\n\n`;
    
    sqlContent += `-- Fin del script de exportación\n`;
    
    // Escribir archivo
    const outputPath = path.join(__dirname, 'asi_corporativa_complete_export.sql');
    fs.writeFileSync(outputPath, sqlContent, 'utf8');
    
    console.log(`\n✅ Exportación completa exitosa!`);
    console.log(`📁 Archivo generado: ${outputPath}`);
    console.log(`📊 Tablas procesadas: ${tableNames.length}`);
    
    // Mostrar resumen
    const totalLines = sqlContent.split('\n').length;
    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
    console.log(`📝 Líneas totales: ${totalLines}`);
    console.log(`💾 Tamaño del archivo: ${fileSize} KB`);
    
  } catch (error) {
    console.error('❌ Error en la exportación:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

exportCompleteData();