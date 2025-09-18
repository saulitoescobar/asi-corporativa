'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lines', 'start_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha de inicio del contrato'
    });

    await queryInterface.addColumn('lines', 'contract_months', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 12,
      comment: 'Duración del contrato en meses'
    });

    await queryInterface.addColumn('lines', 'renewal_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha de próxima renovación del contrato'
    });

    await queryInterface.addColumn('lines', 'advisor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'advisors',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Asesor asignado a la línea'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('lines', 'start_date');
    await queryInterface.removeColumn('lines', 'contract_months');
    await queryInterface.removeColumn('lines', 'renewal_date');
    await queryInterface.removeColumn('lines', 'advisor_id');
  }
};