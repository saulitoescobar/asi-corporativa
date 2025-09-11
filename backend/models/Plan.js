module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define('Plan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    planName: { type: DataTypes.STRING, allowNull: false, field: 'plan_name' },
    minutes: { type: DataTypes.INTEGER, allowNull: false },
    megabytes: { type: DataTypes.INTEGER, allowNull: false },
    cost: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  }, {
    tableName: 'plans',
    timestamps: false,
  });
  return Plan;
};