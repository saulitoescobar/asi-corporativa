'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar más compañías
    await queryInterface.bulkInsert('companies', [
      { id: 3, name: 'Tecnología Avanzada S.A.' },
      { id: 4, name: 'Servicios Corporativos Ltda.' },
      { id: 5, name: 'Innovación Digital Inc.' },
      { id: 6, name: 'Soluciones Empresariales México' }
    ]);

    // Insertar más posiciones
    await queryInterface.bulkInsert('positions', [
      { id: 3, name: 'Gerente General' },
      { id: 4, name: 'Coordinador' },
      { id: 5, name: 'Analista' },
      { id: 6, name: 'Supervisor' },
      { id: 7, name: 'Ejecutivo' }
    ]);

    // Insertar más usuarios
    await queryInterface.bulkInsert('users', [
      {
        id: 3,
        cui: 'CUI789',
        first_name: 'Carlos',
        last_name: 'Rodríguez',
        join_date: '2025-03-01',
        company_id: 3,
        position_id: 3
      },
      {
        id: 4,
        cui: 'CUI101',
        first_name: 'Ana',
        last_name: 'García',
        join_date: '2025-04-15',
        company_id: 4,
        position_id: 4
      },
      {
        id: 5,
        cui: 'CUI202',
        first_name: 'Luis',
        last_name: 'Martínez',
        join_date: '2025-05-20',
        company_id: 5,
        position_id: 5
      },
      {
        id: 6,
        cui: 'CUI303',
        first_name: 'Laura',
        last_name: 'Hernández',
        join_date: '2025-06-10',
        company_id: 6,
        position_id: 6
      },
      {
        id: 7,
        cui: 'CUI404',
        first_name: 'Roberto',
        last_name: 'Jiménez',
        join_date: '2025-07-05',
        company_id: 3,
        position_id: 7
      }
    ]);

    // Insertar más planes
    await queryInterface.bulkInsert('plans', [
      {
        id: 3,
        plan_name: 'Plan Empresarial',
        minutes: 2000,
        megabytes: 10000,
        cost: 300.00
      },
      {
        id: 4,
        plan_name: 'Plan Ejecutivo',
        minutes: 1500,
        megabytes: 7500,
        cost: 250.00
      },
      {
        id: 5,
        plan_name: 'Plan Lite',
        minutes: 300,
        megabytes: 1000,
        cost: 75.00
      }
    ]);

    // Insertar más telcos
    await queryInterface.bulkInsert('telcos', [
      {
        id: 2,
        name: 'MoviTech',
        address: 'Av. Tecnológica 456',
        phone: '55-2345-6789',
        sales_advisor_id: null,
        post_sales_advisor_id: null
      },
      {
        id: 3,
        name: 'ConectaCorp',
        address: 'Boulevard Central 789',
        phone: '55-3456-7890',
        sales_advisor_id: null,
        post_sales_advisor_id: null
      }
    ]);

    // Insertar más asesores
    await queryInterface.bulkInsert('advisors', [
      {
        id: 3,
        name: 'Sandra González',
        email: 'sandra.g@movitech.com',
        phone: '55-3333-3333',
        type: 'SALE',
        telco_id: 2
      },
      {
        id: 4,
        name: 'Miguel Torres',
        email: 'miguel.t@movitech.com',
        phone: '55-4444-4444',
        type: 'POST_SALE',
        telco_id: 2
      },
      {
        id: 5,
        name: 'Patricia Silva',
        email: 'patricia.s@conectacorp.com',
        phone: '55-5555-5555',
        type: 'SALE',
        telco_id: 3
      },
      {
        id: 6,
        name: 'Fernando López',
        email: 'fernando.l@conectacorp.com',
        phone: '55-6666-6666',
        type: 'POST_SALE',
        telco_id: 3
      }
    ]);

    // Actualizar telcos con asesores
    await queryInterface.bulkUpdate('telcos', 
      {
        sales_advisor_id: 3,
        post_sales_advisor_id: 4
      },
      { id: 2 }
    );

    await queryInterface.bulkUpdate('telcos', 
      {
        sales_advisor_id: 5,
        post_sales_advisor_id: 6
      },
      { id: 3 }
    );

    // Insertar más líneas
    await queryInterface.bulkInsert('lines', [
      {
        id: 3,
        line_number: '55-1111-2222',
        status: 'ACTIVE',
        user_id: 3,
        plan_id: 3,
        telco_id: 2
      },
      {
        id: 4,
        line_number: '55-3333-4444',
        status: 'ACTIVE',
        user_id: 4,
        plan_id: 4,
        telco_id: 2
      },
      {
        id: 5,
        line_number: '55-5555-6666',
        status: 'SUSPENDED',
        user_id: 5,
        plan_id: 5,
        telco_id: 3
      },
      {
        id: 6,
        line_number: '55-7777-8888',
        status: 'ACTIVE',
        user_id: 6,
        plan_id: 1,
        telco_id: 3
      },
      {
        id: 7,
        line_number: '55-9999-0000',
        status: 'ACTIVE',
        user_id: 7,
        plan_id: 2,
        telco_id: 1
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lines', { id: { [Sequelize.Op.gte]: 3 } }, {});
    await queryInterface.bulkDelete('advisors', { id: { [Sequelize.Op.gte]: 3 } }, {});
    await queryInterface.bulkDelete('telcos', { id: { [Sequelize.Op.gte]: 2 } }, {});
    await queryInterface.bulkDelete('plans', { id: { [Sequelize.Op.gte]: 3 } }, {});
    await queryInterface.bulkDelete('users', { id: { [Sequelize.Op.gte]: 3 } }, {});
    await queryInterface.bulkDelete('positions', { id: { [Sequelize.Op.gte]: 3 } }, {});
    await queryInterface.bulkDelete('companies', { id: { [Sequelize.Op.gte]: 3 } }, {});
  }
};