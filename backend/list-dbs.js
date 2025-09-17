const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'root'
});

connection.query('SHOW DATABASES', (err, results) => {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('Bases de datos disponibles:');
    results.forEach(db => {
      console.log('-', db.Database);
    });
  }
  connection.end();
});