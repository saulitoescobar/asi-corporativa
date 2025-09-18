const db = require('./models');

async function updateAdvisorsTelcos() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected');

    // Actualizar asesores para asignarles telcos
    await db.Advisor.update(
      { telcoId: 1 }, // Asignar Claro (ID 1)
      { where: { id: [1, 2] } } // Asesores 1 y 2
    );

    // Crear algunos asesores adicionales para otras telcos si existen
    const telcos = await db.Telco.findAll();
    console.log('Telcos disponibles:', telcos.map(t => ({ id: t.id, name: t.name })));

    if (telcos.length > 1) {
      // Crear asesor para segunda telco
      await db.Advisor.create({
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@tigo.com.gt',
        phone: '55123456',
        type: 'SALE',
        telcoId: telcos[1].id
      });

      await db.Advisor.create({
        name: 'Maria Lopez',
        email: 'maria.lopez@tigo.com.gt', 
        phone: '55234567',
        type: 'POST_SALE',
        telcoId: telcos[1].id
      });
    }

    console.log('Asesores actualizados exitosamente');
    
    // Mostrar resultado
    const advisors = await db.Advisor.findAll({
      include: [{ model: db.Telco, as: 'telco' }]
    });
    
    console.log('\nAsesores con telcos:');
    advisors.forEach(advisor => {
      console.log(`- ${advisor.name} (${advisor.type}) -> ${advisor.telco ? advisor.telco.name : 'Sin telco'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.sequelize.close();
  }
}

updateAdvisorsTelcos();