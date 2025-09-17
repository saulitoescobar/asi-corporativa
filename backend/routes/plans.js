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

// Crear nuevo plan
router.post('/', async (req, res) => {
  try {
    const { planName, cost, megabytes, minutes, additionalServices } = req.body;
    
    // Validaciones básicas
    if (!planName || cost === undefined || megabytes === undefined || !minutes) {
      return res.status(400).json({ error: 'Nombre del plan, costo, megabytes y minutos son requeridos' });
    }

    if (cost < 0 || megabytes < 0) {
      return res.status(400).json({ error: 'Los valores numéricos deben ser positivos' });
    }

    // Convertir GB a MB para almacenamiento
    const megabytesInMB = parseFloat(megabytes) * 1024;

    const plan = await db.Plan.create({
      planName,
      cost: parseFloat(cost),
      megabytes: Math.round(megabytesInMB),
      minutes: minutes.toString(), // Guardar como texto
      additionalServices: additionalServices || null
    });
    
    res.status(201).json(plan);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un plan con ese nombre' });
    }
    res.status(500).json({ error: 'Error al crear plan' });
  }
});

// Actualizar plan
router.put('/:id', async (req, res) => {
  try {
    const { planName, cost, megabytes, minutes, additionalServices } = req.body;
    
    // Validaciones básicas
    if (!planName || cost === undefined || megabytes === undefined || !minutes) {
      return res.status(400).json({ error: 'Nombre del plan, costo, megabytes y minutos son requeridos' });
    }

    if (cost < 0 || megabytes < 0) {
      return res.status(400).json({ error: 'Los valores numéricos deben ser positivos' });
    }

    const plan = await db.Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }

    // Convertir GB a MB para almacenamiento
    const megabytesInMB = parseFloat(megabytes) * 1024;

    await plan.update({
      planName,
      cost: parseFloat(cost),
      megabytes: Math.round(megabytesInMB),
      minutes: minutes.toString(), // Guardar como texto
      additionalServices: additionalServices || null
    });
    
    res.json(plan);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un plan con ese nombre' });
    }
    res.status(500).json({ error: 'Error al actualizar plan' });
  }
});

// Eliminar plan
router.delete('/:id', async (req, res) => {
  try {
    const plan = await db.Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }

    // Verificar si el plan está asignado a alguna línea
    const lines = await db.Line.count({ where: { planId: req.params.id } });
    
    if (lines > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el plan porque está asignado a una o más líneas' 
      });
    }

    await plan.destroy();
    res.json({ message: 'Plan eliminado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar plan' });
  }
});

module.exports = router;