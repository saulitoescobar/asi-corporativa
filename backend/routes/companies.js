const express = require('express');
const router = express.Router();
const db = require('../models');

console.log('Companies route loaded');

// Obtener todas las empresas desde DB
router.get('/', async (req, res) => {
  try {
    const companies = await db.Company.findAll();
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener empresas' });
  }
});

// Obtener empresa por ID desde DB
router.get('/:id', async (req, res) => {
  try {
    const company = await db.Company.findByPk(req.params.id, {
      include: [
        { 
          model: db.User, 
          as: 'users'
        }
      ]
    });
    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    res.json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener empresa' });
  }
});

module.exports = router;