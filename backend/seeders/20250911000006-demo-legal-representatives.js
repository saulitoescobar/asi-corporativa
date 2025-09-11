'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('legal_representatives', [
      {
        first_name: 'Carlos',
        last_name: 'Mendoza',
        cui: '1234567890123',
        birth_date: '1980-05-15',
        profession: 'Abogado',
        company_id: 1,
        start_date: '2020-01-01',
        end_date: null,
        is_active: true,
      },
      {
        first_name: 'Ana',
        last_name: 'García',
        cui: '2345678901234',
        birth_date: '1975-08-20',
        profession: 'Contadora Pública',
        company_id: 2,
        start_date: '2019-03-15',
        end_date: null,
        is_active: true,
      },
      {
        first_name: 'José',
        last_name: 'Rodríguez',
        cui: '3456789012345',
        birth_date: '1985-12-10',
        profession: 'Ingeniero Industrial',
        company_id: 3,
        start_date: '2021-06-01',
        end_date: '2023-12-31',
        is_active: false,
      },
      {
        first_name: 'María',
        last_name: 'López',
        cui: '4567890123456',
        birth_date: '1978-02-28',
        profession: 'Administradora de Empresas',
        company_id: 3,
        start_date: '2024-01-01',
        end_date: null,
        is_active: true,
      },
      {
        first_name: 'Roberto',
        last_name: 'Hernández',
        cui: '5678901234567',
        birth_date: '1982-09-14',
        profession: 'Licenciado en Economía',
        company_id: 4,
        start_date: '2018-11-20',
        end_date: null,
        is_active: true,
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('legal_representatives', null, {});
  }
};