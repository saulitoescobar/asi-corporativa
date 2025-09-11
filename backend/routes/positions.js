const express = require('express');
const router = express.Router();
const db = require('../models');

console.log('Positions route loaded');

// Obtener todas las posiciones desde DB
router.get('/', async (req, res) => {
  try {
    const positions = await db.Position.findAll();
    res.json(positions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener posiciones' });
  }
});

// Obtener posición por ID desde DB
router.get('/:id', async (req, res) => {
  try {
    const position = await db.Position.findByPk(req.params.id, {
      include: [
        { 
          model: db.User, 
          as: 'users'
        }
      ]
    });
    if (!position) {
      return res.status(404).json({ error: 'Posición no encontrada' });
    }
    res.json(position);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener posición' });
  }
});

module.exports = router;