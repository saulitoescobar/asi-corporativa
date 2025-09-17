const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'root',
  database: 'asi_corporativa'
});

connection.query('SELECT * FROM Companies', (err, results) => {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('Companies:', results.length);
    console.log(JSON.stringify(results, null, 2));
  }
  connection.end();
});