module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    nit: { type: DataTypes.STRING(20), allowNull: true, unique: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    legalRepresentative: { 
      type: DataTypes.STRING(100), 
      allowNull: true, 
      field: 'legal_representative' 
    },
    legalRepresentationValidity: { 
      type: DataTypes.DATE, 
      allowNull: true, 
      field: 'legal_representation_validity' 
    },
  }, {
    tableName: 'companies',
    timestamps: false,
  });
  return Company;
};