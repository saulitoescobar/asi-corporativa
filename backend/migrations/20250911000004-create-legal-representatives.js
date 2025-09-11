'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla legal_representatives
    await queryInterface.createTable('legal_representatives', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      cui: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      birth_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      profession: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    });

    // Crear índices para optimizar consultas
    await queryInterface.addIndex('legal_representatives', ['company_id']);
    await queryInterface.addIndex('legal_representatives', ['cui']);
    await queryInterface.addIndex('legal_representatives', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('legal_representatives');
  }
};