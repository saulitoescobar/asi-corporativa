const express = require('express');
const router = express.Router();
const db = require('../models');

// Obtener todas las líneas desde DB
router.get('/', async (req, res) => {
  try {
    const lines = await db.Line.findAll({
      include: [
        { model: db.User, as: 'user', include: [
          { model: db.Company, as: 'company' },
          { model: db.Position, as: 'position' }
        ]},
        { model: db.Plan, as: 'plan' },
        { model: db.Telco, as: 'telco' }
      ]
    });
    res.json(lines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener líneas' });
  }
});

// Obtener línea por ID desde DB
router.get('/:id', async (req, res) => {
  try {
    const line = await db.Line.findByPk(req.params.id, {
      include: [
        { model: db.User, as: 'user', include: [
          { model: db.Company, as: 'company' },
          { model: db.Position, as: 'position' }
        ]},
        { model: db.Plan, as: 'plan' },
        { model: db.Telco, as: 'telco' }
      ]
    });
    if (!line) {
      return res.status(404).json({ error: 'Línea no encontrada' });
    }
    res.json(line);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la línea' });
  }
});

module.exports = router;
