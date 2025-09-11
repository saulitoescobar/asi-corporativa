module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cui: { type: DataTypes.STRING, allowNull: false, unique: true },
    firstName: { type: DataTypes.STRING, allowNull: false, field: 'first_name' },
    lastName: { type: DataTypes.STRING, allowNull: false, field: 'last_name' },
    joinDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'join_date' },
    companyId: { type: DataTypes.INTEGER, field: 'company_id' },
    positionId: { type: DataTypes.INTEGER, field: 'position_id' },
  }, {
    tableName: 'users',
    timestamps: false,
  });
  return User;
};