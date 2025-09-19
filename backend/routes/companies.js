const express = require('express');
const router = express.Router();
const db = require('../models');

console.log('Companies route loaded');

// Obtener todas las empresas desde DB
router.get('/', async (req, res) => {
  try {
    const companies = await db.Company.findAll({
      include: [{
        model: db.LegalRepCompanyPeriod,
        as: 'legalRepPeriods',
        where: { isActive: true },
        required: false,
        include: [{
          model: db.LegalRepresentative,
          as: 'legalRepresentative',
          attributes: ['id', 'firstName', 'lastName', 'cui', 'profession']
        }],
        attributes: ['id', 'startDate', 'endDate', 'isActive']
      }],
      order: [['id', 'ASC']]
    });
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
      include: [{
        model: db.LegalRepCompanyPeriod,
        as: 'legalRepPeriods',
        where: { isActive: true },
        required: false,
        include: [{
          model: db.LegalRepresentative,
          as: 'legalRepresentative',
          attributes: ['id', 'firstName', 'lastName', 'cui', 'profession']
        }],
        attributes: ['id', 'startDate', 'endDate', 'isActive']
      }]
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

// Crear nueva empresa
router.post('/', async (req, res) => {
  try {
    const { name, nit, address, phone, legalRepresentative, legalRepresentationValidity } = req.body;
    
    // Validaciones básicas
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la empresa es requerido' });
    }

    // Verificar si el NIT ya existe (si se proporciona)
    if (nit) {
      const existingCompany = await db.Company.findOne({ where: { nit } });
      if (existingCompany) {
        return res.status(400).json({ error: 'Ya existe una empresa con este NIT' });
      }
    }

    const newCompany = await db.Company.create({
      name: name.trim(),
      nit: nit || null,
      address: address || null,
      phone: phone || null,
      legalRepresentative: legalRepresentative || null,
      legalRepresentationValidity: legalRepresentationValidity || null
    });

    res.status(201).json(newCompany);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'El NIT ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al crear empresa' });
    }
  }
});

// Actualizar empresa
router.put('/:id', async (req, res) => {
  try {
    const { name, nit, address, phone, legalRepresentative, legalRepresentationValidity } = req.body;
    
    const company = await db.Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    // Validaciones básicas
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la empresa es requerido' });
    }

    // Verificar si el NIT ya existe en otra empresa (si se proporciona)
    if (nit && nit !== company.nit) {
      const existingCompany = await db.Company.findOne({ 
        where: { 
          nit,
          id: { [db.Sequelize.Op.ne]: req.params.id }
        } 
      });
      if (existingCompany) {
        return res.status(400).json({ error: 'Ya existe otra empresa con este NIT' });
      }
    }

    await company.update({
      name: name.trim(),
      nit: nit || null,
      address: address || null,
      phone: phone || null,
      legalRepresentative: legalRepresentative || null,
      legalRepresentationValidity: legalRepresentationValidity || null
    });

    res.json(company);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'El NIT ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al actualizar empresa' });
    }
  }
});

// Eliminar empresa
router.delete('/:id', async (req, res) => {
  try {
    const company = await db.Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    // Verificar si hay usuarios asociados a esta empresa
    const usersCount = await db.User.count({ where: { company_id: req.params.id } });
    if (usersCount > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar la empresa porque tiene ${usersCount} usuario(s) asociado(s)` 
      });
    }

    await company.destroy();
    res.json({ message: 'Empresa eliminada exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar empresa' });
  }
});

module.exports = router;