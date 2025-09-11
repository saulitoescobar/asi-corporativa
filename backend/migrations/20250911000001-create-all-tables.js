'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla companies
    await queryInterface.createTable('companies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      }
    });

    // Crear tabla positions
    await queryInterface.createTable('positions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      }
    });

    // Crear tabla users
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cui: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      join_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'companies',
          key: 'id'
        }
      },
      position_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'positions',
          key: 'id'
        }
      }
    });

    // Crear tabla plans
    await queryInterface.createTable('plans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      plan_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      minutes: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      megabytes: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      cost: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      }
    });

    // Crear tabla telcos
    await queryInterface.createTable('telcos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING(200)
      },
      phone: {
        type: Sequelize.STRING(20)
      },
      sales_advisor_id: {
        type: Sequelize.INTEGER
      },
      post_sales_advisor_id: {
        type: Sequelize.INTEGER
      }
    });

    // Crear tabla advisors
    await queryInterface.createTable('advisors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100)
      },
      phone: {
        type: Sequelize.STRING(20)
      },
      type: {
        type: Sequelize.ENUM('SALE','POST_SALE'),
        allowNull: false
      },
      telco_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'telcos',
          key: 'id'
        }
      }
    });

    // Crear tabla lines
    await queryInterface.createTable('lines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      line_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('ACTIVE','INACTIVE'),
        defaultValue: 'ACTIVE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      plan_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'plans',
          key: 'id'
        }
      },
      telco_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'telcos',
          key: 'id'
        }
      }
    });

    // Agregar foreign keys a telcos después de crear advisors
    await queryInterface.addConstraint('telcos', {
      fields: ['sales_advisor_id'],
      type: 'foreign key',
      name: 'fk_telcos_sales_advisor',
      references: {
        table: 'advisors',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('telcos', {
      fields: ['post_sales_advisor_id'],
      type: 'foreign key',
      name: 'fk_telcos_post_sales_advisor',
      references: {
        table: 'advisors',
        field: 'id'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lines');
    await queryInterface.dropTable('advisors');
    await queryInterface.dropTable('telcos');
    await queryInterface.dropTable('plans');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('positions');
    await queryInterface.dropTable('companies');
  }
};