'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar compañías
    await queryInterface.bulkInsert('companies', [
      { id: 1, name: 'Empresa ABC' },
      { id: 2, name: 'Compañía XYZ' }
    ]);

    // Insertar posiciones
    await queryInterface.bulkInsert('positions', [
      { id: 1, name: 'Administrador' },
      { id: 2, name: 'Operador' }
    ]);

    // Insertar usuarios
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        cui: 'CUI123',
        first_name: 'Juan',
        last_name: 'Pérez',
        join_date: '2025-01-01',
        company_id: 1,
        position_id: 1
      },
      {
        id: 2,
        cui: 'CUI456',
        first_name: 'María',
        last_name: 'López',
        join_date: '2025-02-15',
        company_id: 2,
        position_id: 2
      }
    ]);

    // Insertar planes
    await queryInterface.bulkInsert('plans', [
      {
        id: 1,
        plan_name: 'Plan Básico',
        minutes: 500,
        megabytes: 2000,
        cost: 100.00
      },
      {
        id: 2,
        plan_name: 'Plan Premium',
        minutes: 1000,
        megabytes: 5000,
        cost: 200.00
      }
    ]);

    // Insertar telcos (sin asesores por ahora)
    await queryInterface.bulkInsert('telcos', [
      {
        id: 1,
        name: 'Telco A',
        address: 'Calle Falsa 123',
        phone: '55-1234-5678',
        sales_advisor_id: null,
        post_sales_advisor_id: null
      }
    ]);

    // Insertar asesores
    await queryInterface.bulkInsert('advisors', [
      {
        id: 1,
        name: 'Asesor Venta 1',
        email: 'venta1@telcoa.com',
        phone: '55-1111-1111',
        type: 'SALE',
        telco_id: 1
      },
      {
        id: 2,
        name: 'Asesor Post Venta 1',
        email: 'postventa1@telcoa.com',
        phone: '55-2222-2222',
        type: 'POST_SALE',
        telco_id: 1
      }
    ]);

    // Actualizar telco con asesores
    await queryInterface.bulkUpdate('telcos', 
      {
        sales_advisor_id: 1,
        post_sales_advisor_id: 2
      },
      { id: 1 }
    );

    // Insertar líneas
    await queryInterface.bulkInsert('lines', [
      {
        id: 1,
        line_number: '55-1234-5678',
        status: 'ACTIVE',
        user_id: 1,
        plan_id: 1,
        telco_id: 1
      },
      {
        id: 2,
        line_number: '55-8765-4321',
        status: 'INACTIVE',
        user_id: 2,
        plan_id: 2,
        telco_id: 1
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lines', null, {});
    await queryInterface.bulkDelete('advisors', null, {});
    await queryInterface.bulkDelete('telcos', null, {});
    await queryInterface.bulkDelete('plans', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('positions', null, {});
    await queryInterface.bulkDelete('companies', null, {});
  }
};