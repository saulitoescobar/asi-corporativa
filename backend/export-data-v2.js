const mysql = require('mysql2');
const fs = require('fs');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'root',
  database: 'asicorporativa'
});

connection.connect();

async function exportData() {
  let sqlScript = `-- Script de datos para ASI Corporativa
-- Generado el ${new Date().toISOString()}
-- 
-- Instrucciones:
-- 1. Ejecutar las migraciones primero: npx sequelize-cli db:migrate
-- 2. Ejecutar este script para poblar con datos: mysql -u root -p asicorporativa < data-export.sql
-- 3. O copiar y pegar cada INSERT manualmente

`;

  // Primero obtenemos las tablas que realmente existen
  try {
    const [tables] = await connection.promise().query('SHOW TABLES');
    console.log('Tablas encontradas:', tables.map(t => Object.values(t)[0]));
    
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      
      try {
        const [rows] = await connection.promise().query(`SELECT * FROM \`${tableName}\``);
        
        if (rows.length > 0) {
          sqlScript += `-- Datos de ${tableName} (${rows.length} registros)\n`;
          const columns = Object.keys(rows[0]).join('`, `');
          sqlScript += `INSERT INTO \`${tableName}\` (\`${columns}\`) VALUES\n`;
          
          rows.forEach((row, index) => {
            const values = Object.values(row).map(val => {
              if (val === null) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
              return val;
            }).join(', ');
            
            const comma = index === rows.length - 1 ? ';' : ',';
            sqlScript += `(${values})${comma}\n`;
          });
          sqlScript += '\n';
        } else {
          sqlScript += `-- No hay datos en ${tableName}\n\n`;
        }
      } catch (error) {
        sqlScript += `-- Error en ${tableName}: ${error.message}\n\n`;
        console.log(`Error en ${tableName}:`, error.message);
      }
    }
  } catch (error) {
    console.log('Error obteniendo tablas:', error.message);
  }

  // Escribir el archivo
  fs.writeFileSync('../data-export.sql', sqlScript);
  console.log('✅ Datos exportados a data-export.sql');
  
  connection.end();
}

exportData().catch(console.error);