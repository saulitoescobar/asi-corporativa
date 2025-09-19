const express = require('express');
const { Sequelize } = require('sequelize');
const db = require('../models');
const router = express.Router();

// GET - Obtener todos los representantes legales con sus períodos de empresas
router.get('/', async (req, res) => {
  try {
    const representatives = await db.LegalRepresentative.findAll({
      include: [{
        model: db.LegalRepCompanyPeriod,
        as: 'companyPeriods',
        include: [{
          model: db.Company,
          as: 'company',
          attributes: ['id', 'name', 'nit']
        }],
        order: [['startDate', 'DESC']]
      }],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });
    res.json(representatives);
  } catch (error) {
    console.error('Error fetching legal representatives:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener todos los representantes legales de una empresa (activos e inactivos)
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const periods = await db.LegalRepCompanyPeriod.findAll({
      where: { companyId },
      include: [{
        model: db.LegalRepresentative,
        as: 'legalRepresentative'
      }, {
        model: db.Company,
        as: 'company'
      }],
      order: [['startDate', 'DESC']]
    });
    res.json(periods);
  } catch (error) {
    console.error('Error fetching legal representatives for company:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener representantes legales activos por empresa
router.get('/company/:companyId/active', async (req, res) => {
  try {
    const { companyId } = req.params;
    const activePeriods = await db.LegalRepCompanyPeriod.findAll({
      where: { 
        companyId,
        isActive: true 
      },
      include: [{
        model: db.LegalRepresentative,
        as: 'legalRepresentative'
      }, {
        model: db.Company,
        as: 'company'
      }],
      order: [['startDate', 'DESC']]
    });
    res.json(activePeriods);
  } catch (error) {
    console.error('Error fetching active legal representatives:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener historial completo de representantes legales por empresa
router.get('/company/:companyId/history', async (req, res) => {
  try {
    const { companyId } = req.params;
    const allPeriods = await db.LegalRepCompanyPeriod.findAll({
      where: { companyId },
      include: [{
        model: db.LegalRepresentative,
        as: 'legalRepresentative'
      }, {
        model: db.Company,
        as: 'company'
      }],
      order: [['startDate', 'DESC']]
    });
    res.json(allPeriods);
  } catch (error) {
    console.error('Error fetching legal representatives history:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener un representante legal por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const representative = await db.LegalRepresentative.findByPk(id, {
      include: [{ model: db.Company, as: 'company' }]
    });
    
    if (!representative) {
      return res.status(404).json({ error: 'Representante legal no encontrado' });
    }
    
    res.json(representative);
  } catch (error) {
    console.error('Error fetching legal representative:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Crear nuevo representante legal con período de empresa
router.post('/', async (req, res) => {
  console.log('POST /api/legal-representatives called');
  console.log('Request body:', req.body);
  
  try {
    const { firstName, lastName, cui, birthDate, profession, email, phone, address, companyId, startDate, endDate } = req.body;
    
    console.log('Extracted fields:', { firstName, lastName, cui, birthDate, profession, companyId, startDate, endDate });
    
    // Validaciones básicas
    if (!firstName || !lastName || !cui || !birthDate || !profession) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({ 
        error: 'Los campos nombre, apellido, CUI, fecha de nacimiento y profesión son obligatorios' 
      });
    }

    // Si se especifica companyId, también debe especificarse startDate
    if (companyId && !startDate) {
      console.log('Validation failed: companyId without startDate');
      return res.status(400).json({ 
        error: 'Si se especifica una empresa, la fecha de inicio es obligatoria' 
      });
    }

    // Verificar que la empresa existe (si se especifica)
    if (companyId) {
      console.log('Checking company existence for ID:', companyId);
      const company = await db.Company.findByPk(companyId);
      if (!company) {
        console.log('Company not found');
        return res.status(400).json({ error: 'La empresa especificada no existe' });
      }
      console.log('Company found:', company.name);
    }

    // Verificar si ya existe un representante legal con el mismo CUI
    const existingRepresentative = await db.LegalRepresentative.findOne({ 
      where: { cui }
    });

    let representative;
    
    if (existingRepresentative) {
      // Si ya existe, usar el existente
      representative = existingRepresentative;
    } else {
      // Si no existe, crear uno nuevo
      representative = await db.LegalRepresentative.create({
        firstName,
        lastName,
        cui,
        birthDate,
        profession,
        email,
        phone,
        address
      });
    }

    // Si se especifica una empresa, crear el período
    if (companyId) {
      // Verificar que no haya conflicto de fechas para el mismo representante en la misma empresa
      const conflictingPeriod = await db.LegalRepCompanyPeriod.findOne({ 
        where: { 
          legalRepresentativeId: representative.id,
          companyId,
          [Sequelize.Op.or]: [
            // Caso 1: Nuevo período se solapa con período existente que no tiene fecha fin
            {
              endDate: null,
              startDate: { [Sequelize.Op.lte]: endDate || new Date() }
            },
            // Caso 2: Nuevo período se solapa con período existente que tiene fecha fin
            {
              endDate: { [Sequelize.Op.gte]: startDate },
              startDate: { [Sequelize.Op.lte]: endDate || new Date() }
            }
          ]
        }
      });

      if (conflictingPeriod) {
        return res.status(400).json({ 
          error: 'Ya existe un período activo para este representante legal en esta empresa que se solapa con las fechas especificadas' 
        });
      }

      // Crear el período de empresa
      const isActive = !endDate;
      await db.LegalRepCompanyPeriod.create({
        legalRepresentativeId: representative.id,
        companyId,
        startDate,
        endDate,
        isActive
      });
    }

    // Obtener el representante con sus períodos
    const createdRepresentative = await db.LegalRepresentative.findByPk(representative.id, {
      include: [{
        model: db.LegalRepCompanyPeriod,
        as: 'companyPeriods',
        include: [{
          model: db.Company,
          as: 'company',
          attributes: ['id', 'name', 'nit']
        }],
        order: [['startDate', 'DESC']]
      }]
    });

    res.status(201).json(createdRepresentative);
  } catch (error) {
    console.error('Error creating legal representative:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Actualizar representante legal
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, cui, birthDate, profession, companyId, startDate, endDate } = req.body;
    
    const representative = await db.LegalRepresentative.findByPk(id);
    if (!representative) {
      return res.status(404).json({ error: 'Representante legal no encontrado' });
    }

    // Validaciones
    if (!firstName || !lastName || !cui || !birthDate || !profession || !companyId || !startDate) {
      return res.status(400).json({ 
        error: 'Los campos nombre, apellido, CUI, fecha de nacimiento, profesión, empresa y fecha de inicio son obligatorios' 
      });
    }

    // Verificar que la empresa existe
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(400).json({ error: 'La empresa especificada no existe' });
    }

    // Verificar que no haya conflicto de fechas para el mismo CUI en la misma empresa (excluyendo el registro actual)
    const conflictingRepresentative = await db.LegalRepresentative.findOne({ 
      where: { 
        cui, 
        companyId,
        id: { [Sequelize.Op.ne]: id },
        [Sequelize.Op.or]: [
          // Caso 1: Nuevo período se solapa con período existente que no tiene fecha fin
          {
            endDate: null,
            startDate: { [Sequelize.Op.lte]: endDate || new Date() }
          },
          // Caso 2: Nuevo período se solapa con período existente que tiene fecha fin
          {
            endDate: { [Sequelize.Op.not]: null },
            [Sequelize.Op.and]: [
              { startDate: { [Sequelize.Op.lte]: endDate || new Date() } },
              { endDate: { [Sequelize.Op.gte]: startDate } }
            ]
          }
        ]
      }
    });
    
    if (conflictingRepresentative) {
      return res.status(400).json({ 
        error: 'Este representante ya tiene un período que se solapa con las fechas especificadas en esta empresa' 
      });
    }

    // Actualizar estado activo
    const isActive = !endDate;

    await representative.update({
      firstName,
      lastName,
      cui,
      birthDate,
      profession,
      companyId,
      startDate,
      endDate,
      isActive
    });

    const updatedRepresentative = await db.LegalRepresentative.findByPk(id, {
      include: [{ model: db.Company, as: 'company' }]
    });

    res.json(updatedRepresentative);
  } catch (error) {
    console.error('Error updating legal representative:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar representante legal
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const representative = await db.LegalRepresentative.findByPk(id);
    if (!representative) {
      return res.status(404).json({ error: 'Representante legal no encontrado' });
    }

    await representative.destroy();
    res.json({ message: 'Representante legal eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting legal representative:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH - Activar/Desactivar período de representante legal
router.patch('/period/:periodId/toggle-active', async (req, res) => {
  try {
    const { periodId } = req.params;
    
    const period = await db.LegalRepCompanyPeriod.findByPk(periodId);
    if (!period) {
      return res.status(404).json({ error: 'Período no encontrado' });
    }

    if (!period.isActive) {
      // Activar este período
      await period.update({ isActive: true, endDate: null });
    } else {
      // Desactivar este período
      await period.update({ isActive: false, endDate: new Date() });
    }

    const updatedPeriod = await db.LegalRepCompanyPeriod.findByPk(periodId, {
      include: [{
        model: db.LegalRepresentative,
        as: 'legalRepresentative'
      }, {
        model: db.Company,
        as: 'company'
      }]
    });

    res.json(updatedPeriod);
  } catch (error) {
    console.error('Error toggling period status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH - Activar/Desactivar representante legal (endpoint legacy - mantener por compatibilidad)
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const { id } = req.params;
    
    const representative = await db.LegalRepresentative.findByPk(id);
    if (!representative) {
      return res.status(404).json({ error: 'Representante legal no encontrado' });
    }

    if (!representative.isActive) {
      // Activar este representante
      await representative.update({ isActive: true, endDate: null });
    } else {
      // Desactivar este representante
      await representative.update({ isActive: false, endDate: new Date() });
    }

    const updatedRepresentative = await db.LegalRepresentative.findByPk(id, {
      include: [{ model: db.Company, as: 'company' }]
    });

    res.json(updatedRepresentative);
  } catch (error) {
    console.error('Error toggling legal representative status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;