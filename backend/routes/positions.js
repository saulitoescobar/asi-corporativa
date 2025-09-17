const express = require('express');
const router = express.Router();
const db = require('../models');

console.log('Positions route loaded');

// Obtener todas las posiciones desde DB
router.get('/', async (req, res) => {
  console.log('GET /api/positions called');
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

// Crear nueva posición
router.post('/', async (req, res) => {
  console.log('POST /api/positions called with body:', req.body);
  try {
    const { name } = req.body;
    
    // Validaciones básicas
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la posición es requerido' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }

    const position = await db.Position.create({
      name: name.trim()
    });
    
    res.status(201).json(position);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe una posición con ese nombre' });
    }
    res.status(500).json({ error: 'Error al crear posición' });
  }
});

// Actualizar posición
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validaciones básicas
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la posición es requerido' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }

    const position = await db.Position.findByPk(req.params.id);
    if (!position) {
      return res.status(404).json({ error: 'Posición no encontrada' });
    }

    await position.update({
      name: name.trim()
    });
    
    res.json(position);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe una posición con ese nombre' });
    }
    res.status(500).json({ error: 'Error al actualizar posición' });
  }
});

// Eliminar posición
router.delete('/:id', async (req, res) => {
  try {
    const position = await db.Position.findByPk(req.params.id);
    if (!position) {
      return res.status(404).json({ error: 'Posición no encontrada' });
    }

    // Verificar si la posición está asignada a algún usuario
    const users = await db.User.count({ where: { positionId: req.params.id } });
    
    if (users > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la posición porque está asignada a uno o más usuarios' 
      });
    }

    await position.destroy();
    res.json({ message: 'Posición eliminada exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar posición' });
  }
});

module.exports = router;