'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('companies', 'legal_representative');
    await queryInterface.removeColumn('companies', 'legal_representation_validity');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'legal_representative', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('companies', 'legal_representation_validity', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }
};