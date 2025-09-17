'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cambiar el campo minutes de INTEGER a TEXT
    await queryInterface.changeColumn('plans', 'minutes', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    // Agregar el campo additional_services
    await queryInterface.addColumn('plans', 'additional_services', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir: quitar el campo additional_services
    await queryInterface.removeColumn('plans', 'additional_services');

    // Revertir: cambiar minutes de TEXT a INTEGER
    await queryInterface.changeColumn('plans', 'minutes', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};