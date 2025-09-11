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

// simple health check
app.get('/', (req, res) => {
  res.send({ status: 'API running' });
});

// Rutas del módulo de líneas corporativas
const linesRouter = require('./routes/lines');
const usersRouter = require('./routes/users');
const telcosRouter = require('./routes/telcos');
const companiesRouter = require('./routes/companies');
const plansRouter = require('./routes/plans');
const positionsRouter = require('./routes/positions');
const advisorsRouter = require('./routes/advisors');

app.use('/api/lines', linesRouter);
app.use('/api/users', usersRouter);
app.use('/api/telcos', telcosRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/plans', plansRouter);
app.use('/api/positions', positionsRouter);
app.use('/api/advisors', advisorsRouter);

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