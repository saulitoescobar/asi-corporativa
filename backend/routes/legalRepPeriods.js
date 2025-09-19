const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require('sequelize');

// Obtener todos los períodos de representación legal
router.get('/periods', async (req, res) => {
  try {
    const periods = await db.LegalRepCompanyPeriod.findAll({
      include: [
        { 
          model: db.LegalRepresentative, 
          as: 'legalRepresentative',
          attributes: ['id', 'firstName', 'lastName', 'cui', 'profession']
        },
        { 
          model: db.Company, 
          as: 'company',
          attributes: ['id', 'name', 'nit']
        }
      ],
      order: [['startDate', 'DESC'], ['isActive', 'DESC']]
    });
    
    res.json(periods);
  } catch (err) {
    console.error('Error al obtener períodos:', err);
    res.status(500).json({ error: 'Error al obtener los períodos de representación legal' });
  }
});

// Obtener períodos activos por empresa
router.get('/periods/company/:companyId/active', async (req, res) => {
  try {
    const periods = await db.LegalRepCompanyPeriod.findAll({
      where: { 
        companyId: req.params.companyId,
        isActive: true 
      },
      include: [
        { 
          model: db.LegalRepresentative, 
          as: 'legalRepresentative',
          attributes: ['id', 'firstName', 'lastName', 'cui', 'profession', 'email', 'phone']
        }
      ],
      order: [['startDate', 'DESC']]
    });
    
    res.json(periods);
  } catch (err) {
    console.error('Error al obtener períodos activos:', err);
    res.status(500).json({ error: 'Error al obtener los períodos activos' });
  }
});

// Obtener historial completo de una empresa
router.get('/periods/company/:companyId/history', async (req, res) => {
  try {
    const periods = await db.LegalRepCompanyPeriod.findAll({
      where: { companyId: req.params.companyId },
      include: [
        { 
          model: db.LegalRepresentative, 
          as: 'legalRepresentative',
          attributes: ['id', 'firstName', 'lastName', 'cui', 'profession']
        }
      ],
      order: [['startDate', 'DESC']]
    });
    
    res.json(periods);
  } catch (err) {
    console.error('Error al obtener historial:', err);
    res.status(500).json({ error: 'Error al obtener el historial de representantes legales' });
  }
});

// Obtener empresas activas de un representante legal
router.get('/periods/representative/:repId/active', async (req, res) => {
  try {
    const periods = await db.LegalRepCompanyPeriod.findAll({
      where: { 
        legalRepresentativeId: req.params.repId,
        isActive: true 
      },
      include: [
        { 
          model: db.Company, 
          as: 'company',
          attributes: ['id', 'name', 'nit', 'email', 'phone']
        }
      ],
      order: [['startDate', 'DESC']]
    });
    
    res.json(periods);
  } catch (err) {
    console.error('Error al obtener empresas activas:', err);
    res.status(500).json({ error: 'Error al obtener las empresas activas del representante' });
  }
});

// Crear nuevo período de representación
router.post('/periods', async (req, res) => {
  try {
    const { legalRepresentativeId, companyId, startDate, endDate, notes } = req.body;
    
    // Validar que no hay períodos solapados para la misma empresa
    const overlappingPeriod = await db.LegalRepCompanyPeriod.findOne({
      where: {
        companyId,
        isActive: true,
        [Op.or]: [
          {
            startDate: { [Op.lte]: startDate },
            [Op.or]: [
              { endDate: null },
              { endDate: { [Op.gte]: startDate } }
            ]
          }
        ]
      }
    });

    if (overlappingPeriod) {
      return res.status(400).json({ 
        error: 'Ya existe un representante legal activo para esta empresa en el período indicado' 
      });
    }

    const newPeriod = await db.LegalRepCompanyPeriod.create({
      legalRepresentativeId,
      companyId,
      startDate,
      endDate,
      isActive: !endDate, // Si no hay fecha de fin, está activo
      notes
    });

    const periodWithDetails = await db.LegalRepCompanyPeriod.findByPk(newPeriod.id, {
      include: [
        { model: db.LegalRepresentative, as: 'legalRepresentative' },
        { model: db.Company, as: 'company' }
      ]
    });

    res.status(201).json(periodWithDetails);
  } catch (err) {
    console.error('Error al crear período:', err);
    res.status(500).json({ error: 'Error al crear el período de representación legal' });
  }
});

// Finalizar período (poner fecha de fin)
router.put('/periods/:id/end', async (req, res) => {
  try {
    const { endDate, notes } = req.body;
    
    const period = await db.LegalRepCompanyPeriod.findByPk(req.params.id);
    if (!period) {
      return res.status(404).json({ error: 'Período no encontrado' });
    }

    if (!period.isActive) {
      return res.status(400).json({ error: 'Este período ya está finalizado' });
    }

    await period.update({
      endDate,
      isActive: false,
      notes: notes || period.notes
    });

    const updatedPeriod = await db.LegalRepCompanyPeriod.findByPk(req.params.id, {
      include: [
        { model: db.LegalRepresentative, as: 'legalRepresentative' },
        { model: db.Company, as: 'company' }
      ]
    });

    res.json(updatedPeriod);
  } catch (err) {
    console.error('Error al finalizar período:', err);
    res.status(500).json({ error: 'Error al finalizar el período' });
  }
});

// Actualizar período
router.put('/periods/:id', async (req, res) => {
  try {
    const { startDate, endDate, notes, isActive } = req.body;
    
    const period = await db.LegalRepCompanyPeriod.findByPk(req.params.id);
    if (!period) {
      return res.status(404).json({ error: 'Período no encontrado' });
    }

    await period.update({
      startDate: startDate || period.startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : period.isActive,
      notes: notes || period.notes
    });

    const updatedPeriod = await db.LegalRepCompanyPeriod.findByPk(req.params.id, {
      include: [
        { model: db.LegalRepresentative, as: 'legalRepresentative' },
        { model: db.Company, as: 'company' }
      ]
    });

    res.json(updatedPeriod);
  } catch (err) {
    console.error('Error al actualizar período:', err);
    res.status(500).json({ error: 'Error al actualizar el período' });
  }
});

// Eliminar período
router.delete('/periods/:id', async (req, res) => {
  try {
    const period = await db.LegalRepCompanyPeriod.findByPk(req.params.id);
    if (!period) {
      return res.status(404).json({ error: 'Período no encontrado' });
    }

    await period.destroy();
    res.json({ message: 'Período eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar período:', err);
    res.status(500).json({ error: 'Error al eliminar el período' });
  }
});

module.exports = router;