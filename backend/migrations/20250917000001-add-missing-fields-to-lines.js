'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Agregar campo monthly_cost a la tabla lines
      await queryInterface.addColumn('lines', 'monthly_cost', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Costo mensual de la línea'
      });

      // Agregar campo notes a la tabla lines
      await queryInterface.addColumn('lines', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas adicionales sobre la línea'
      });

      console.log('Campos monthly_cost y notes agregados exitosamente a la tabla lines');
    } catch (error) {
      console.error('Error agregando campos a lines:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('lines', 'monthly_cost');
      await queryInterface.removeColumn('lines', 'notes');
    } catch (error) {
      console.error('Error removiendo campos de lines:', error);
      throw error;
    }
  }
};