const express = require('express');
const { Sequelize } = require('sequelize');
const { LegalRepresentative, Company } = require('../models');
const router = express.Router();

// GET - Obtener todos los representantes legales con información de la empresa
router.get('/', async (req, res) => {
  try {
    const representatives = await LegalRepresentative.findAll({
      include: [{ model: Company, as: 'company' }],
      order: [['isActive', 'DESC'], ['startDate', 'DESC']]
    });
    res.json(representatives);
  } catch (error) {
    console.error('Error fetching legal representatives:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener representantes legales por empresa
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const representatives = await LegalRepresentative.findAll({
      where: { companyId },
      include: [{ model: Company, as: 'company' }],
      order: [['isActive', 'DESC'], ['startDate', 'DESC']]
    });
    res.json(representatives);
  } catch (error) {
    console.error('Error fetching legal representatives for company:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener representante legal activo por empresa
router.get('/company/:companyId/active', async (req, res) => {
  try {
    const { companyId } = req.params;
    const representative = await LegalRepresentative.findOne({
      where: { companyId, isActive: true },
      include: [{ model: Company, as: 'company' }]
    });
    res.json(representative);
  } catch (error) {
    console.error('Error fetching active legal representative:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET - Obtener un representante legal por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const representative = await LegalRepresentative.findByPk(id, {
      include: [{ model: Company, as: 'company' }]
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

// POST - Crear nuevo representante legal
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, cui, birthDate, profession, companyId, startDate, endDate } = req.body;
    
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

    // Verificar que no haya conflicto de fechas para el mismo CUI en la misma empresa
    const conflictingRepresentative = await LegalRepresentative.findOne({ 
      where: { 
        cui, 
        companyId,
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

    // Si no se especifica endDate, se marca como activo
    const isActive = !endDate;

    const representative = await LegalRepresentative.create({
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

    const createdRepresentative = await LegalRepresentative.findByPk(representative.id, {
      include: [{ model: Company, as: 'company' }]
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
    
    const representative = await LegalRepresentative.findByPk(id);
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
    const conflictingRepresentative = await LegalRepresentative.findOne({ 
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

    const updatedRepresentative = await LegalRepresentative.findByPk(id, {
      include: [{ model: Company, as: 'company' }]
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
    
    const representative = await LegalRepresentative.findByPk(id);
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

// PATCH - Activar/Desactivar representante legal
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const { id } = req.params;
    
    const representative = await LegalRepresentative.findByPk(id);
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

    const updatedRepresentative = await LegalRepresentative.findByPk(id, {
      include: [{ model: Company, as: 'company' }]
    });

    res.json(updatedRepresentative);
  } catch (error) {
    console.error('Error toggling legal representative status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;