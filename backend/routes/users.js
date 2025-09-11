const express = require('express');
const router = express.Router();
const db = require('../models');

console.log('Users route loaded');

// Obtener todos los usuarios desde DB
router.get('/', async (req, res) => {
  try {
    const users = await db.User.findAll({
      include: [
        { model: db.Company, as: 'company' },
        { model: db.Position, as: 'position' }
      ]
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener usuario por ID desde DB
router.get('/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      include: [
        { model: db.Company, as: 'company' },
        { model: db.Position, as: 'position' }
      ]
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

module.exports = router;