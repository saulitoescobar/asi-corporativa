module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define('Plan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    planName: { type: DataTypes.STRING, allowNull: false, field: 'plan_name' },
    minutes: { type: DataTypes.TEXT, allowNull: false },
    megabytes: { type: DataTypes.INTEGER, allowNull: false },
    cost: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    additionalServices: { type: DataTypes.TEXT, allowNull: true, field: 'additional_services' },
  }, {
    tableName: 'plans',
    timestamps: false,
  });
  return Plan;
};