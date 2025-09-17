const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require('sequelize');

// Obtener todos los telcos desde DB con paginación y búsqueda avanzada
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      name = '', 
      address = '', 
      phone = '' 
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Construir filtros dinámicos
    const whereConditions = [];

    // Búsqueda global (aplica a múltiples campos)
    if (search) {
      whereConditions.push({
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { address: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ]
      });
    }

    // Filtros específicos por columna
    if (name) {
      whereConditions.push({ name: { [Op.like]: `%${name}%` } });
    }
    if (address) {
      whereConditions.push({ address: { [Op.like]: `%${address}%` } });
    }
    if (phone) {
      whereConditions.push({ phone: { [Op.like]: `%${phone}%` } });
    }

    // Combinar todas las condiciones con AND
    const whereClause = whereConditions.length > 0 ? {
      [Op.and]: whereConditions
    } : {};

    const { count, rows } = await db.Telco.findAndCountAll({
      where: whereClause,
      include: [
        { model: db.Advisor, as: 'salesAdvisor' },
        { model: db.Advisor, as: 'postSalesAdvisor' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']]
    });

    res.json({
      telcos: rows,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      },
      filters: {
        applied: {
          search: search || null,
          name: name || null,
          address: address || null,
          phone: phone || null
        }
      }
    });
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

// Crear nuevo telco
router.post('/', async (req, res) => {
  try {
    const { name, address, phone, salesAdvisorId, postSalesAdvisorId } = req.body;
    
    // Validaciones básicas
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre del telco es requerido' });
    }

    // Verificar que los asesores existan si se proporcionan
    if (salesAdvisorId) {
      const salesAdvisor = await db.Advisor.findByPk(salesAdvisorId);
      if (!salesAdvisor) {
        return res.status(400).json({ error: 'El asesor de ventas especificado no existe' });
      }
    }

    if (postSalesAdvisorId) {
      const postSalesAdvisor = await db.Advisor.findByPk(postSalesAdvisorId);
      if (!postSalesAdvisor) {
        return res.status(400).json({ error: 'El asesor post ventas especificado no existe' });
      }
    }

    const newTelco = await db.Telco.create({
      name: name.trim(),
      address: address || null,
      phone: phone || null,
      salesAdvisorId: salesAdvisorId || null,
      postSalesAdvisorId: postSalesAdvisorId || null
    });

    // Obtener el telco creado con sus relaciones
    const createdTelco = await db.Telco.findByPk(newTelco.id, {
      include: [
        { model: db.Advisor, as: 'salesAdvisor' },
        { model: db.Advisor, as: 'postSalesAdvisor' }
      ]
    });

    res.status(201).json(createdTelco);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear telco' });
  }
});

// Actualizar telco
router.put('/:id', async (req, res) => {
  try {
    const { name, address, phone, salesAdvisorId, postSalesAdvisorId } = req.body;
    
    const telco = await db.Telco.findByPk(req.params.id);
    if (!telco) {
      return res.status(404).json({ error: 'Telco no encontrado' });
    }

    // Validaciones básicas
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre del telco es requerido' });
    }

    // Verificar que los asesores existan si se proporcionan
    if (salesAdvisorId) {
      const salesAdvisor = await db.Advisor.findByPk(salesAdvisorId);
      if (!salesAdvisor) {
        return res.status(400).json({ error: 'El asesor de ventas especificado no existe' });
      }
    }

    if (postSalesAdvisorId) {
      const postSalesAdvisor = await db.Advisor.findByPk(postSalesAdvisorId);
      if (!postSalesAdvisor) {
        return res.status(400).json({ error: 'El asesor post ventas especificado no existe' });
      }
    }

    await telco.update({
      name: name.trim(),
      address: address || null,
      phone: phone || null,
      salesAdvisorId: salesAdvisorId || null,
      postSalesAdvisorId: postSalesAdvisorId || null
    });

    // Obtener el telco actualizado con sus relaciones
    const updatedTelco = await db.Telco.findByPk(req.params.id, {
      include: [
        { model: db.Advisor, as: 'salesAdvisor' },
        { model: db.Advisor, as: 'postSalesAdvisor' }
      ]
    });

    res.json(updatedTelco);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar telco' });
  }
});

// Eliminar telco
router.delete('/:id', async (req, res) => {
  try {
    const telco = await db.Telco.findByPk(req.params.id);
    if (!telco) {
      return res.status(404).json({ error: 'Telco no encontrado' });
    }

    await telco.destroy();
    res.json({ message: 'Telco eliminado exitosamente' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      res.status(400).json({ error: 'No se puede eliminar el telco porque tiene registros relacionados' });
    } else {
      res.status(500).json({ error: 'Error al eliminar telco' });
    }
  }
});

module.exports = router;