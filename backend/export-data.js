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

const tables = ['Companies', 'LegalRepresentatives', 'Positions', 'Users', 'Advisors', 'Telcos', 'Plans', 'Lines'];

async function exportData() {
  let sqlScript = `-- Script de datos para ASI Corporativa
-- Generado el ${new Date().toISOString()}
-- 
-- Instrucciones:
-- 1. Ejecutar las migraciones primero
-- 2. Ejecutar este script para poblar con datos

`;

  for (const table of tables) {
    try {
      const [rows] = await connection.promise().query(`SELECT * FROM ${table}`);
      
      if (rows.length > 0) {
        sqlScript += `-- Datos de ${table}\n`;
        const columns = Object.keys(rows[0]).join(', ');
        sqlScript += `INSERT INTO ${table} (${columns}) VALUES\n`;
        
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
        sqlScript += `-- No hay datos en ${table}\n\n`;
      }
    } catch (error) {
      sqlScript += `-- Error en ${table}: ${error.message}\n\n`;
    }
  }

  // Escribir el archivo
  fs.writeFileSync('../data-export.sql', sqlScript);
  console.log('✅ Datos exportados a data-export.sql');
  
  connection.end();
}

exportData().catch(console.error);