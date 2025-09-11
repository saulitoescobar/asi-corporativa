module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    nit: { type: DataTypes.STRING(20), allowNull: true, unique: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    phone: { type: DataTypes.STRING(20), allowNull: true },
  }, {
    tableName: 'companies',
    timestamps: false,
  });
  return Company;
};