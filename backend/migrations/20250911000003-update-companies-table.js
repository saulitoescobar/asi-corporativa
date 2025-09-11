'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar las nuevas columnas a la tabla companies
    await queryInterface.addColumn('companies', 'nit', {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true
    });
    
    await queryInterface.addColumn('companies', 'address', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('companies', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
    
    await queryInterface.addColumn('companies', 'legal_representative', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    
    await queryInterface.addColumn('companies', 'legal_representation_validity', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('companies', 'nit');
    await queryInterface.removeColumn('companies', 'address');
    await queryInterface.removeColumn('companies', 'phone');
    await queryInterface.removeColumn('companies', 'legal_representative');
    await queryInterface.removeColumn('companies', 'legal_representation_validity');
  }
};