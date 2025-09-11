const db = require('./models');

async function addMoreTestData() {
  try {
    // Conectar a la base de datos
    await db.sequelize.authenticate();
    console.log('Conectado a la base de datos');

    // Agregar más compañías
    const newCompanies = await db.Company.bulkCreate([
      { name: 'Tecnología Avanzada S.A.' },
      { name: 'Servicios Corporativos Ltda.' },
      { name: 'Innovación Digital Inc.' },
      { name: 'Soluciones Empresariales México' }
    ]);
    console.log('Nuevas compañías agregadas');

    // Agregar más posiciones
    const newPositions = await db.Position.bulkCreate([
      { name: 'Gerente General' },
      { name: 'Coordinador' },
      { name: 'Analista' },
      { name: 'Supervisor' },
      { name: 'Ejecutivo' }
    ]);
    console.log('Nuevas posiciones agregadas');

    // Agregar más usuarios
    const newUsers = await db.User.bulkCreate([
      {
        cui: 'CUI789',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        joinDate: '2025-03-01',
        companyId: 3,
        positionId: 3
      },
      {
        cui: 'CUI101',
        firstName: 'Ana',
        lastName: 'García',
        joinDate: '2025-04-15',
        companyId: 4,
        positionId: 4
      },
      {
        cui: 'CUI202',
        firstName: 'Luis',
        lastName: 'Martínez',
        joinDate: '2025-05-20',
        companyId: 5,
        positionId: 5
      },
      {
        cui: 'CUI303',
        firstName: 'Laura',
        lastName: 'Hernández',
        joinDate: '2025-06-10',
        companyId: 6,
        positionId: 6
      },
      {
        cui: 'CUI404',
        firstName: 'Roberto',
        lastName: 'Jiménez',
        joinDate: '2025-07-05',
        companyId: 3,
        positionId: 7
      }
    ]);
    console.log('Nuevos usuarios agregados');

    // Agregar más planes
    const newPlans = await db.Plan.bulkCreate([
      {
        planName: 'Plan Empresarial',
        minutes: 2000,
        megabytes: 10000,
        cost: 350.00
      },
      {
        planName: 'Plan Ejecutivo',
        minutes: 1500,
        megabytes: 8000,
        cost: 280.00
      },
      {
        planName: 'Plan Corporativo Plus',
        minutes: 3000,
        megabytes: 15000,
        cost: 450.00
      },
      {
        planName: 'Plan Básico Pro',
        minutes: 800,
        megabytes: 3000,
        cost: 150.00
      }
    ]);
    console.log('Nuevos planes agregados');

    // Agregar más telcos
    const newTelcos = await db.Telco.bulkCreate([
      {
        name: 'Telco México',
        address: 'Av. Reforma 123, CDMX',
        phone: '55-9999-8888'
      },
      {
        name: 'Comunicaciones del Norte',
        address: 'Blvd. Independencia 456, Monterrey',
        phone: '81-7777-6666'
      },
      {
        name: 'Red Nacional',
        address: 'Calzada Guadalupe 789, Guadalajara',
        phone: '33-5555-4444'
      }
    ]);
    console.log('Nuevos telcos agregados');

    // Agregar más asesores
    const newAdvisors = await db.Advisor.bulkCreate([
      {
        name: 'Patricia Vega',
        email: 'patricia.vega@telcomexico.com',
        phone: '55-1010-2020',
        type: 'SALE',
        telcoId: 2
      },
      {
        name: 'Miguel Torres',
        email: 'miguel.torres@telcomexico.com',
        phone: '55-3030-4040',
        type: 'POST_SALE',
        telcoId: 2
      },
      {
        name: 'Carmen Silva',
        email: 'carmen.silva@comnorte.com',
        phone: '81-5050-6060',
        type: 'SALE',
        telcoId: 3
      },
      {
        name: 'Jorge Morales',
        email: 'jorge.morales@comnorte.com',
        phone: '81-7070-8080',
        type: 'POST_SALE',
        telcoId: 3
      },
      {
        name: 'Silvia Ramírez',
        email: 'silvia.ramirez@rednacional.com',
        phone: '33-9090-1010',
        type: 'SALE',
        telcoId: 4
      },
      {
        name: 'Fernando Castro',
        email: 'fernando.castro@rednacional.com',
        phone: '33-2020-3030',
        type: 'POST_SALE',
        telcoId: 4
      }
    ]);
    console.log('Nuevos asesores agregados');

    // Actualizar telcos con asesores
    await db.Telco.update(
      { salesAdvisorId: 3, postSalesAdvisorId: 4 },
      { where: { id: 2 } }
    );
    await db.Telco.update(
      { salesAdvisorId: 5, postSalesAdvisorId: 6 },
      { where: { id: 3 } }
    );
    await db.Telco.update(
      { salesAdvisorId: 7, postSalesAdvisorId: 8 },
      { where: { id: 4 } }
    );
    console.log('Telcos actualizados con asesores');

    // Agregar más líneas
    const newLines = await db.Line.bulkCreate([
      {
        lineNumber: '55-2468-1357',
        status: 'ACTIVE',
        userId: 3,
        planId: 3,
        telcoId: 2
      },
      {
        lineNumber: '81-1111-2222',
        status: 'ACTIVE',
        userId: 4,
        planId: 4,
        telcoId: 3
      },
      {
        lineNumber: '33-3333-4444',
        status: 'INACTIVE',
        userId: 5,
        planId: 5,
        telcoId: 4
      },
      {
        lineNumber: '55-5678-9012',
        status: 'ACTIVE',
        userId: 6,
        planId: 6,
        telcoId: 1
      },
      {
        lineNumber: '81-9876-5432',
        status: 'ACTIVE',
        userId: 7,
        planId: 3,
        telcoId: 2
      },
      {
        lineNumber: '33-1357-2468',
        status: 'INACTIVE',
        userId: 3,
        planId: 4,
        telcoId: 3
      },
      {
        lineNumber: '55-9999-0000',
        status: 'ACTIVE',
        userId: 4,
        planId: 5,
        telcoId: 4
      }
    ]);
    console.log('Nuevas líneas agregadas');

    console.log('✅ Datos de prueba adicionales agregados exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error agregando datos de prueba:', err);
    process.exit(1);
  }
}

addMoreTestData();