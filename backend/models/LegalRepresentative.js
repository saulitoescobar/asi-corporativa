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
      allowNull: false,
      unique: true
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
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'legal_representatives',
    timestamps: false,
    // Métodos getter
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