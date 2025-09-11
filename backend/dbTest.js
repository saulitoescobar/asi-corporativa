// Script para validar conexión a la base de datos usando parámetros de .env
require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    console.log('Datos de conexión:');
    console.log(`HOST:     ${process.env.DB_HOST}`);
    console.log(`USER:     ${process.env.DB_USER}`);
    console.log(`DATABASE: ${process.env.DB_NAME}`);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Conexión exitosa a la base de datos.');
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('Error de conexión a la base de datos:', err.message);
    process.exit(1);
  }
})();