// Script de sincronización y semillas (seed) para Sequelize
const db = require('./models');

async function seed() {
  try {
    // Forzar recreación de tablas
    await db.sequelize.sync({ force: true });
    console.log('Tablas recreadas');

    // Crear compañías
    const empresaABC = await db.Company.create({ name: 'Empresa ABC' });
    const empresaXYZ = await db.Company.create({ name: 'Compañía XYZ' });

    // Crear posiciones
    const administrador = await db.Position.create({ name: 'Administrador' });
    const operador = await db.Position.create({ name: 'Operador' });

    // Crear usuarios
    const juan = await db.User.create({
      cui: 'CUI123', firstName: 'Juan', lastName: 'Pérez', joinDate: '2025-01-01',
      companyId: empresaABC.id, positionId: administrador.id
    });
    const maria = await db.User.create({
      cui: 'CUI456', firstName: 'María', lastName: 'López', joinDate: '2025-02-15',
      companyId: empresaXYZ.id, positionId: operador.id
    });

    // Crear planes
    const planBasico = await db.Plan.create({ planName: 'Plan Básico', minutes: 500, megabytes: 2000, cost: 100.00 });
    const planPremium = await db.Plan.create({ planName: 'Plan Premium', minutes: 1000, megabytes: 5000, cost: 200.00 });

    // Crear telco sin asesores
    const telcoA = await db.Telco.create({ name: 'Telco A', address: 'Calle Falsa 123', phone: '55-1234-5678' });

    // Crear asesores
    const asesordeVenta = await db.Advisor.create({ name: 'Asesor Venta 1', email: 'venta1@telcoa.com', phone: '55-1111-1111', type: 'SALE', telcoId: telcoA.id });
    const asesorPost = await db.Advisor.create({ name: 'Asesor Post Venta 1', email: 'postventa1@telcoa.com', phone: '55-2222-2222', type: 'POST_SALE', telcoId: telcoA.id });

    // Actualizar Telco con asesores
    telcoA.salesAdvisorId = asesordeVenta.id;
    telcoA.postSalesAdvisorId = asesorPost.id;
    await telcoA.save();

    // Crear líneas de ejemplo
    await db.Line.create({ lineNumber: '55-1234-5678', status: 'ACTIVE', userId: juan.id, planId: planBasico.id, telcoId: telcoA.id });
    await db.Line.create({ lineNumber: '55-8765-4321', status: 'INACTIVE', userId: maria.id, planId: planPremium.id, telcoId: telcoA.id });

    console.log('Datos semilla cargados con éxito');
    process.exit(0);
  } catch (err) {
    console.error('Error en seed:', err);
    process.exit(1);
  }
}

seed();