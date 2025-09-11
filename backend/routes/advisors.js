const express = require('express');
const router = express.Router();
const db = require('../models');

console.log('Advisors route loaded');

// Obtener todos los asesores desde DB
router.get('/', async (req, res) => {
  try {
    const advisors = await db.Advisor.findAll();
    res.json(advisors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener asesores' });
  }
});

// Obtener asesor por ID desde DB
router.get('/:id', async (req, res) => {
  try {
    const advisor = await db.Advisor.findByPk(req.params.id, {
      include: [
        { 
          model: db.Telco, 
          as: 'salesTelcos',
          foreignKey: 'salesAdvisorId'
        },
        { 
          model: db.Telco, 
          as: 'postSalesTelcos',
          foreignKey: 'postSalesAdvisorId'
        }
      ]
    });
    if (!advisor) {
      return res.status(404).json({ error: 'Asesor no encontrado' });
    }
    res.json(advisor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener asesor' });
  }
});

module.exports = router;