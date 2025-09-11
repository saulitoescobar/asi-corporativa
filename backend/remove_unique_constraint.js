require('dotenv').config();
const mysql = require('mysql2/promise');

async function removeUniqueConstraint() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3333,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asicorporativa'
  });

  try {
    // Verificar si existe la restricción única
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'legal_representatives' 
      AND COLUMN_NAME = 'cui' 
      AND CONSTRAINT_NAME != 'PRIMARY'
    `, [process.env.DB_NAME || 'asicorporativa']);

    console.log('Restricciones encontradas:', constraints);

    if (constraints.length > 0) {
      for (const constraint of constraints) {
        console.log(`Eliminando restricción: ${constraint.CONSTRAINT_NAME}`);
        await connection.execute(`
          ALTER TABLE legal_representatives 
          DROP INDEX ${constraint.CONSTRAINT_NAME}
        `);
        console.log(`Restricción ${constraint.CONSTRAINT_NAME} eliminada exitosamente`);
      }
    } else {
      console.log('No se encontraron restricciones únicas en el campo CUI');
    }

    // Verificar estructura final
    const [structure] = await connection.execute('DESCRIBE legal_representatives');
    console.log('\nEstructura final de la tabla:');
    console.table(structure);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

removeUniqueConstraint();