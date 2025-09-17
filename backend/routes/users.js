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

// Crear nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { cui, firstName, lastName, joinDate, companyId, positionId } = req.body;
    
    // Validaciones básicas
    if (!cui || !firstName || !lastName || !joinDate || !companyId || !positionId) {
      return res.status(400).json({ 
        error: 'CUI, nombre, apellido, fecha de ingreso, empresa y posición son requeridos' 
      });
    }

    // Validar formato de CUI (13 dígitos)
    if (!/^\d{13}$/.test(cui)) {
      return res.status(400).json({ error: 'El CUI debe tener exactamente 13 dígitos' });
    }

    // Validar que el nombre y apellido tengan al menos 2 caracteres
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      return res.status(400).json({ error: 'El nombre y apellido deben tener al menos 2 caracteres' });
    }

    // Verificar que la empresa existe
    const company = await db.Company.findByPk(companyId);
    if (!company) {
      return res.status(400).json({ error: 'La empresa seleccionada no existe' });
    }

    // Verificar que la posición existe
    const position = await db.Position.findByPk(positionId);
    if (!position) {
      return res.status(400).json({ error: 'La posición seleccionada no existe' });
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(joinDate)) {
      return res.status(400).json({ error: 'La fecha debe tener el formato YYYY-MM-DD' });
    }

    const user = await db.User.create({
      cui: cui.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      joinDate,
      companyId: parseInt(companyId),
      positionId: parseInt(positionId)
    });
    
    // Obtener el usuario creado con las relaciones
    const createdUser = await db.User.findByPk(user.id, {
      include: [
        { model: db.Company, as: 'company' },
        { model: db.Position, as: 'position' }
      ]
    });

    res.status(201).json(createdUser);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un usuario con ese CUI' });
    }
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { cui, firstName, lastName, joinDate, companyId, positionId } = req.body;
    
    // Validaciones básicas
    if (!cui || !firstName || !lastName || !joinDate || !companyId || !positionId) {
      return res.status(400).json({ 
        error: 'CUI, nombre, apellido, fecha de ingreso, empresa y posición son requeridos' 
      });
    }

    // Validar formato de CUI (13 dígitos)
    if (!/^\d{13}$/.test(cui)) {
      return res.status(400).json({ error: 'El CUI debe tener exactamente 13 dígitos' });
    }

    // Validar que el nombre y apellido tengan al menos 2 caracteres
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      return res.status(400).json({ error: 'El nombre y apellido deben tener al menos 2 caracteres' });
    }

    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que la empresa existe
    const company = await db.Company.findByPk(companyId);
    if (!company) {
      return res.status(400).json({ error: 'La empresa seleccionada no existe' });
    }

    // Verificar que la posición existe
    const position = await db.Position.findByPk(positionId);
    if (!position) {
      return res.status(400).json({ error: 'La posición seleccionada no existe' });
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(joinDate)) {
      return res.status(400).json({ error: 'La fecha debe tener el formato YYYY-MM-DD' });
    }

    await user.update({
      cui: cui.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      joinDate,
      companyId: parseInt(companyId),
      positionId: parseInt(positionId)
    });
    
    // Obtener el usuario actualizado con las relaciones
    const updatedUser = await db.User.findByPk(user.id, {
      include: [
        { model: db.Company, as: 'company' },
        { model: db.Position, as: 'position' }
      ]
    });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un usuario con ese CUI' });
    }
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.destroy();
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;