const express = require('express');
const router = express.Router();
const db = require('../models');

console.log('Plans route loaded');

// Obtener todos los planes desde DB
router.get('/', async (req, res) => {
  try {
    const plans = await db.Plan.findAll();
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener planes' });
  }
});

// Obtener plan por ID desde DB
router.get('/:id', async (req, res) => {
  try {
    const plan = await db.Plan.findByPk(req.params.id, {
      include: [
        { 
          model: db.Line, 
          as: 'lines'
        }
      ]
    });
    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener plan' });
  }
});

module.exports = router;