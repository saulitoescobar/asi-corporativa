const express = require('express');
const router = express.Router();
const db = require('../models');

console.log('Advisors route loaded');

// Obtener todos los asesores desde DB
router.get('/', async (req, res) => {
  try {
    const { telcoId } = req.query;
    const whereClause = {};
    
    if (telcoId) {
      whereClause.telcoId = telcoId;
    }
    
    const advisors = await db.Advisor.findAll({
      where: whereClause,
      include: [
        { 
          model: db.Telco, 
          as: 'telco' 
        }
      ]
    });
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

// Crear nuevo asesor
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, type } = req.body;
    
    // Validaciones básicas
    if (!name || !email || !type) {
      return res.status(400).json({ error: 'Nombre, email y tipo son requeridos' });
    }

    if (!['SALE', 'POST_SALE'].includes(type)) {
      return res.status(400).json({ error: 'Tipo debe ser SALE o POST_SALE' });
    }

    const advisor = await db.Advisor.create({
      name,
      email,
      phone,
      type
    });
    
    res.status(201).json(advisor);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un asesor con ese email' });
    }
    res.status(500).json({ error: 'Error al crear asesor' });
  }
});

// Actualizar asesor
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, type } = req.body;
    
    // Validaciones básicas
    if (!name || !email || !type) {
      return res.status(400).json({ error: 'Nombre, email y tipo son requeridos' });
    }

    if (!['SALE', 'POST_SALE'].includes(type)) {
      return res.status(400).json({ error: 'Tipo debe ser SALE o POST_SALE' });
    }

    const advisor = await db.Advisor.findByPk(req.params.id);
    if (!advisor) {
      return res.status(404).json({ error: 'Asesor no encontrado' });
    }

    await advisor.update({
      name,
      email,
      phone,
      type
    });
    
    res.json(advisor);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un asesor con ese email' });
    }
    res.status(500).json({ error: 'Error al actualizar asesor' });
  }
});

// Eliminar asesor
router.delete('/:id', async (req, res) => {
  try {
    const advisor = await db.Advisor.findByPk(req.params.id);
    if (!advisor) {
      return res.status(404).json({ error: 'Asesor no encontrado' });
    }

    // Verificar si el asesor está asignado a algún telco
    const salesTelcos = await db.Telco.count({ where: { salesAdvisorId: req.params.id } });
    const postSalesTelcos = await db.Telco.count({ where: { postSalesAdvisorId: req.params.id } });
    
    if (salesTelcos > 0 || postSalesTelcos > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el asesor porque está asignado a uno o más telcos' 
      });
    }

    await advisor.destroy();
    res.json({ message: 'Asesor eliminado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar asesor' });
  }
});

module.exports = router;