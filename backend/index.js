require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

// middleware
app.use(cors());
app.use(express.json());

// Debugging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Body:`, req.body);
  next();
});

// simple health check
app.get('/', (req, res) => {
  res.send({ status: 'API running' });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Test API</title></head>
    <body>
      <h1>Test Positions API</h1>
      <button onclick="testGet()">Test GET</button>
      <button onclick="testPost()">Test POST</button>
      <div id="result"></div>
      <script>
        async function testGet() {
          try {
            const response = await fetch('/api/positions');
            const data = await response.json();
            document.getElementById('result').innerHTML = 'GET Result: ' + JSON.stringify(data, null, 2);
          } catch (error) {
            document.getElementById('result').innerHTML = 'GET Error: ' + error.message;
          }
        }
        async function testPost() {
          try {
            const response = await fetch('/api/positions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: 'Gerente de Prueba' })
            });
            const data = await response.json();
            document.getElementById('result').innerHTML = 'POST Result: ' + JSON.stringify(data, null, 2);
          } catch (error) {
            document.getElementById('result').innerHTML = 'POST Error: ' + error.message;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Rutas del módulo de líneas corporativas
const linesRouter = require('./routes/lines');
const usersRouter = require('./routes/users');
const telcosRouter = require('./routes/telcos');
const companiesRouter = require('./routes/companies');
const plansRouter = require('./routes/plans');
const positionsRouter = require('./routes/positions');
const advisorsRouter = require('./routes/advisors');
const legalRepresentativesRouter = require('./routes/legalRepresentatives');

app.use('/api/lines', linesRouter);
app.use('/api/users', usersRouter);
app.use('/api/telcos', telcosRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/plans', plansRouter);
app.use('/api/positions', positionsRouter);
app.use('/api/advisors', advisorsRouter);
app.use('/api/legal-representatives', legalRepresentativesRouter);

// Conectar a la base de datos y luego iniciar servidor
const db = require('./models');
const PORT = process.env.PORT || 3001;
db.sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Unable to connect to DB:', err));
// sincronizar modelos y levantar servidor
db.sequelize.sync()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend API listening on port ${PORT}`));
  })
  .catch(err => console.error('Error syncing DB:', err));