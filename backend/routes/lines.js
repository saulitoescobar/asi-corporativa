const express = require('express');
const router = express.Router();
const db = require('../models');

// Obtener todas las líneas desde DB
router.get('/', async (req, res) => {
  try {
    const lines = await db.Line.findAll({
      include: [
        { 
          model: db.User, 
          as: 'user', 
          include: [
            { model: db.Company, as: 'company' },
            { model: db.Position, as: 'position' }
          ]
        },
        { model: db.Plan, as: 'plan' },
        { model: db.Telco, as: 'telco' },
        { model: db.Advisor, as: 'advisor' }
      ]
    });
    
    // Obtener todos los asesores para no hacer consultas individuales
    const advisors = await db.Advisor.findAll();
    const advisorsMap = new Map(advisors.map(advisor => [advisor.id, advisor.toJSON()]));
    
    // Transformar los datos para incluir información heredada de la telco
    const transformedLines = lines.map(line => {
      const lineData = line.toJSON();
      
      // Si hay telco, asignar asesores usando el mapa
      if (lineData.telco) {
        if (lineData.telco.salesAdvisorId && advisorsMap.has(lineData.telco.salesAdvisorId)) {
          lineData.salesAdvisor = advisorsMap.get(lineData.telco.salesAdvisorId);
        }
        if (lineData.telco.postSalesAdvisorId && advisorsMap.has(lineData.telco.postSalesAdvisorId)) {
          lineData.postSalesAdvisor = advisorsMap.get(lineData.telco.postSalesAdvisorId);
        }
      }
      
      return lineData;
    });
    
    res.json(transformedLines);
  } catch (err) {
    console.error('Error in lines route:', err);
    res.status(500).json({ error: 'Error al obtener líneas' });
  }
});

// Obtener línea por ID desde DB
router.get('/:id', async (req, res) => {
  try {
    const line = await db.Line.findByPk(req.params.id, {
      include: [
        { 
          model: db.User, 
          as: 'user', 
          include: [
            { model: db.Company, as: 'company' },
            { model: db.Position, as: 'position' }
          ]
        },
        { model: db.Plan, as: 'plan' },
        { model: db.Telco, as: 'telco' },
        { model: db.Advisor, as: 'advisor' }
      ]
    });
    
    if (!line) {
      return res.status(404).json({ error: 'Línea no encontrada' });
    }
    
    const lineData = line.toJSON();
    
    // Si hay telco, buscar sus asesores por separado
    if (lineData.telco && lineData.telco.salesAdvisorId) {
      const salesAdvisor = await db.Advisor.findByPk(lineData.telco.salesAdvisorId);
      if (salesAdvisor) {
        lineData.salesAdvisor = salesAdvisor.toJSON();
      }
    }
    
    if (lineData.telco && lineData.telco.postSalesAdvisorId) {
      const postSalesAdvisor = await db.Advisor.findByPk(lineData.telco.postSalesAdvisorId);
      if (postSalesAdvisor) {
        lineData.postSalesAdvisor = postSalesAdvisor.toJSON();
      }
    }
    
    res.json(lineData);
  } catch (err) {
    console.error('Error in single line route:', err);
    res.status(500).json({ error: 'Error al obtener la línea' });
  }
});

// Crear nueva línea
router.post('/', async (req, res) => {
  try {
    const {
      lineNumber,
      status,
      userId,
      planId,
      telcoId,
      startDate,
      contractMonths,
      renewalDate,
      assignmentDate
    } = req.body;

    // Validaciones básicas
    if (!lineNumber) {
      return res.status(400).json({ error: 'El número de línea es requerido' });
    }

    // Verificar si el número de línea ya existe
    const existingLine = await db.Line.findOne({ where: { lineNumber } });
    if (existingLine) {
      return res.status(400).json({ error: 'El número de línea ya existe' });
    }

    // Obtener la telco seleccionada para heredar los asesores
    let salesAdvisorId = null;
    let postSalesAdvisorId = null;
    
    if (telcoId) {
      const telco = await db.Telco.findByPk(telcoId);
      if (telco) {
        salesAdvisorId = telco.salesAdvisorId;
        postSalesAdvisorId = telco.postSalesAdvisorId;
      }
    }

    const newLine = await db.Line.create({
      lineNumber,
      status: status || 'ACTIVE',
      userId,
      planId,
      telcoId,
      advisorId: salesAdvisorId, // Asignar asesor de ventas por defecto
      startDate,
      contractMonths: contractMonths || 12,
      renewalDate,
      assignmentDate
    });

    // Obtener la línea creada con todas las relaciones
    const createdLine = await db.Line.findByPk(newLine.id, {
      include: [
        { model: db.User, as: 'user', include: [
          { model: db.Company, as: 'company' },
          { model: db.Position, as: 'position' }
        ]},
        { model: db.Plan, as: 'plan' },
        { model: db.Telco, as: 'telco' },
        { model: db.Advisor, as: 'advisor' }
      ]
    });

    res.status(201).json(createdLine);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'El número de línea ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear la línea' });
    }
  }
});

// Actualizar línea
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      lineNumber,
      status,
      userId,
      planId,
      telcoId,
      startDate,
      contractMonths,
      renewalDate,
      assignmentDate
    } = req.body;

    const line = await db.Line.findByPk(id);
    if (!line) {
      return res.status(404).json({ error: 'Línea no encontrada' });
    }

    // Verificar si el nuevo número de línea ya existe (si se está cambiando)
    if (lineNumber && lineNumber !== line.lineNumber) {
      const existingLine = await db.Line.findOne({ 
        where: { lineNumber, id: { [db.Sequelize.Op.ne]: id } }
      });
      if (existingLine) {
        return res.status(400).json({ error: 'El número de línea ya existe' });
      }
    }

    // Si se cambia la telco, actualizar el asesor heredado
    let advisorId = line.advisorId;
    if (telcoId && telcoId !== line.telcoId) {
      const telco = await db.Telco.findByPk(telcoId);
      if (telco) {
        advisorId = telco.salesAdvisorId;
      }
    }

    await line.update({
      lineNumber: lineNumber || line.lineNumber,
      status: status !== undefined ? status : line.status,
      userId: userId !== undefined ? userId : line.userId,
      planId: planId !== undefined ? planId : line.planId,
      telcoId: telcoId !== undefined ? telcoId : line.telcoId,
      advisorId: advisorId,
      startDate: startDate !== undefined ? startDate : line.startDate,
      contractMonths: contractMonths !== undefined ? contractMonths : line.contractMonths,
      renewalDate: renewalDate !== undefined ? renewalDate : line.renewalDate,
      assignmentDate: assignmentDate !== undefined ? assignmentDate : line.assignmentDate
    });

    // Obtener la línea actualizada con todas las relaciones
    const updatedLine = await db.Line.findByPk(id, {
      include: [
        { model: db.User, as: 'user', include: [
          { model: db.Company, as: 'company' },
          { model: db.Position, as: 'position' }
        ]},
        { model: db.Plan, as: 'plan' },
        { model: db.Telco, as: 'telco' },
        { model: db.Advisor, as: 'advisor' }
      ]
    });

    res.json(updatedLine);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'El número de línea ya existe' });
    } else {
      res.status(500).json({ error: 'Error al actualizar la línea' });
    }
  }
});

// Eliminar línea
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const line = await db.Line.findByPk(id);
    if (!line) {
      return res.status(404).json({ error: 'Línea no encontrada' });
    }

    await line.destroy();
    res.json({ message: 'Línea eliminada exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la línea' });
  }
});

// Cambiar estado de línea (activar/desactivar)
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validar que el estado sea válido
    if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido. Debe ser ACTIVE o INACTIVE' });
    }
    
    const line = await db.Line.findByPk(id);
    if (!line) {
      return res.status(404).json({ error: 'Línea no encontrada' });
    }

    // Actualizar el estado
    await line.update({ status });
    
    // Obtener la línea actualizada con todas sus relaciones
    const updatedLine = await db.Line.findByPk(id, {
      include: [
        { 
          model: db.User, 
          as: 'user', 
          include: [
            { model: db.Company, as: 'company' },
            { model: db.Position, as: 'position' }
          ]
        },
        { model: db.Plan, as: 'plan' },
        { model: db.Telco, as: 'telco' },
        { model: db.Advisor, as: 'advisor' }
      ]
    });
    
    res.json(updatedLine);
  } catch (err) {
    console.error('Error updating line status:', err);
    res.status(500).json({ error: 'Error al actualizar el estado de la línea' });
  }
});

module.exports = router;
