'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Migrar datos existentes a la nueva tabla de períodos
    const existingReps = await queryInterface.sequelize.query(
      'SELECT id, company_id, start_date, end_date, is_active FROM legal_representatives',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Insertar los datos existentes en la nueva tabla de períodos
    for (const rep of existingReps) {
      await queryInterface.bulkInsert('legal_rep_company_periods', [{
        legal_representative_id: rep.id,
        company_id: rep.company_id,
        start_date: rep.start_date,
        end_date: rep.end_date,
        is_active: rep.is_active,
        created_at: new Date(),
        updated_at: new Date()
      }]);
    }

    // Remover las columnas de la tabla legal_representatives
    await queryInterface.removeColumn('legal_representatives', 'company_id');
    await queryInterface.removeColumn('legal_representatives', 'start_date');
    await queryInterface.removeColumn('legal_representatives', 'end_date');
    await queryInterface.removeColumn('legal_representatives', 'is_active');
  },

  down: async (queryInterface, Sequelize) => {
    // Restaurar las columnas originales
    await queryInterface.addColumn('legal_representatives', 'company_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      }
    });
    
    await queryInterface.addColumn('legal_representatives', 'start_date', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('legal_representatives', 'end_date', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('legal_representatives', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    // Migrar datos de vuelta (tomar el período más reciente por cada representante)
    const periods = await queryInterface.sequelize.query(
      `SELECT legal_representative_id, company_id, start_date, end_date, is_active
       FROM legal_rep_company_periods
       WHERE id IN (
         SELECT MAX(id) 
         FROM legal_rep_company_periods 
         GROUP BY legal_representative_id
       )`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const period of periods) {
      await queryInterface.sequelize.query(
        `UPDATE legal_representatives 
         SET company_id = :company_id, start_date = :start_date, 
             end_date = :end_date, is_active = :is_active
         WHERE id = :legal_representative_id`,
        {
          replacements: {
            company_id: period.company_id,
            start_date: period.start_date,
            end_date: period.end_date,
            is_active: period.is_active,
            legal_representative_id: period.legal_representative_id
          }
        }
      );
    }
  }
};