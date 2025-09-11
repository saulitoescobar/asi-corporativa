'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Actualizar las empresas existentes con nuevos datos
    await queryInterface.bulkUpdate('companies', 
      {
        nit: '900123456-1',
        address: 'Calle 123 #45-67, Bogotá',
        phone: '601-2345678',
        legal_representative: 'Juan Carlos Pérez',
        legal_representation_validity: '2025-12-31'
      },
      { id: 1 }
    );

    await queryInterface.bulkUpdate('companies', 
      {
        nit: '900987654-2',
        address: 'Carrera 89 #12-34, Medellín',
        phone: '604-8765432',
        legal_representative: 'María López García',
        legal_representation_validity: '2026-06-30'
      },
      { id: 2 }
    );

    await queryInterface.bulkUpdate('companies', 
      {
        nit: '900555666-3',
        address: 'Avenida Tecnológica #78-90, Cali',
        phone: '602-5556677',
        legal_representative: 'Carlos Rodríguez Silva',
        legal_representation_validity: '2025-09-15'
      },
      { id: 3 }
    );

    await queryInterface.bulkUpdate('companies', 
      {
        nit: '900111222-4',
        address: 'Centro Empresarial #56-78, Barranquilla',
        phone: '605-1112233',
        legal_representative: 'Ana García Martínez',
        legal_representation_validity: '2026-03-20'
      },
      { id: 4 }
    );

    await queryInterface.bulkUpdate('companies', 
      {
        nit: '900333444-5',
        address: 'Zona Digital #34-56, Pereira',
        phone: '606-3334455',
        legal_representative: 'Luis Martínez Hernández',
        legal_representation_validity: '2025-11-10'
      },
      { id: 5 }
    );

    await queryInterface.bulkUpdate('companies', 
      {
        nit: '900777888-6',
        address: 'Sector Empresarial #67-89, Bucaramanga',
        phone: '607-7778899',
        legal_representative: 'Laura Hernández Torres',
        legal_representation_validity: '2026-08-25'
      },
      { id: 6 }
    );
  },

  async down(queryInterface, Sequelize) {
    // Revertir los cambios removiendo los datos de las nuevas columnas
    await queryInterface.bulkUpdate('companies', 
      {
        nit: null,
        address: null,
        phone: null,
        legal_representative: null,
        legal_representation_validity: null
      },
      {}
    );
  }
};