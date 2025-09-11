module.exports = (sequelize, DataTypes) => {
  const LegalRepresentative = sequelize.define('LegalRepresentative', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { 
      type: DataTypes.STRING(50), 
      allowNull: false, 
      field: 'first_name' 
    },
    lastName: { 
      type: DataTypes.STRING(50), 
      allowNull: false, 
      field: 'last_name' 
    },
    cui: { 
      type: DataTypes.STRING(50), 
      allowNull: false 
    },
    birthDate: { 
      type: DataTypes.DATE, 
      allowNull: false, 
      field: 'birth_date' 
    },
    profession: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
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
    }
  }, {
    tableName: 'legal_representatives',
    timestamps: false,
    getterMethods: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
      age() {
        if (!this.birthDate) return null;
        const today = new Date();
        const birthDate = new Date(this.birthDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      }
    }
  });
  return LegalRepresentative;
};