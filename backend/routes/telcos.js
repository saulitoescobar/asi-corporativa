const express = require('express');
const router = express.Router();
const db = require('../models');

// Obtener todos los telcos desde DB
router.get('/', async (req, res) => {
  try {
    const telcos = await db.Telco.findAll({
      include: [
        { model: db.Advisor, as: 'salesAdvisor' },
        { model: db.Advisor, as: 'postSalesAdvisor' }
      ]
    });
    res.json(telcos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener telcos' });
  }
});

// Obtener telco por ID desde DB
router.get('/:id', async (req, res) => {
  try {
    const telco = await db.Telco.findByPk(req.params.id, {
      include: [
        { model: db.Advisor, as: 'salesAdvisor' },
        { model: db.Advisor, as: 'postSalesAdvisor' }
      ]
    });
    if (!telco) {
      return res.status(404).json({ error: 'Telco no encontrado' });
    }
    res.json(telco);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el telco' });
  }
});

module.exports = router;