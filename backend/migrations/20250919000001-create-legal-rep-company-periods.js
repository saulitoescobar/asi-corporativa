'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('legal_rep_company_periods', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      legal_representative_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'legal_representatives',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de inicio del período como representante legal'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de fin del período (null si está activo)'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si el período está activo actualmente'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas sobre este período de representación'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Agregar índice único para evitar períodos solapados
    await queryInterface.addIndex('legal_rep_company_periods', {
      fields: ['legal_representative_id', 'company_id', 'start_date'],
      name: 'idx_legal_rep_company_period_unique'
    });

    // Agregar índice para búsquedas por empresa
    await queryInterface.addIndex('legal_rep_company_periods', {
      fields: ['company_id', 'is_active'],
      name: 'idx_company_active_reps'
    });

    // Agregar índice para búsquedas por representante
    await queryInterface.addIndex('legal_rep_company_periods', {
      fields: ['legal_representative_id', 'is_active'],
      name: 'idx_rep_active_companies'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('legal_rep_company_periods');
  }
};