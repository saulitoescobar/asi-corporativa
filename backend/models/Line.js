module.exports = (sequelize, DataTypes) => {
  const Line = sequelize.define('Line', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    lineNumber: { type: DataTypes.STRING, allowNull: false, unique: true, field: 'line_number' },
    status: { type: DataTypes.ENUM('ACTIVE','INACTIVE'), defaultValue: 'ACTIVE' },
    userId: { type: DataTypes.INTEGER, field: 'user_id', allowNull: true },
    planId: { type: DataTypes.INTEGER, field: 'plan_id', allowNull: true },
    telcoId: { type: DataTypes.INTEGER, field: 'telco_id', allowNull: true },
  }, {
    tableName: 'lines',
    timestamps: false,
  });
  return Line;
};