module.exports = (sequelize, DataTypes) => {
  const LegalRepCompanyPeriod = sequelize.define('LegalRepCompanyPeriod', {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    legalRepresentativeId: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      field: 'legal_representative_id' 
    },
    companyId: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      field: 'company_id' 
    },
    startDate: { 
      type: DataTypes.DATE, 
      allowNull: false, 
      field: 'start_date' 
    },
    endDate: { 
      type: DataTypes.DATE, 
      allowNull: true, 
      field: 'end_date' 
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      allowNull: false, 
      defaultValue: true, 
      field: 'is_active' 
    },
    notes: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    }
  }, {
    tableName: 'legal_rep_company_periods',
    timestamps: true,
    underscored: true,
    // Validaciones a nivel de modelo
    validate: {
      endDateAfterStartDate() {
        if (this.endDate && this.startDate && this.endDate <= this.startDate) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      },
      activePeriodsValidation() {
        if (this.isActive && this.endDate) {
          throw new Error('Un período activo no puede tener fecha de fin');
        }
        if (!this.isActive && !this.endDate) {
          throw new Error('Un período inactivo debe tener fecha de fin');
        }
      }
    }
  });

  return LegalRepCompanyPeriod;
};