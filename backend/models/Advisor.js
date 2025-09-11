module.exports = (sequelize, DataTypes) => {
  const Advisor = sequelize.define('Advisor', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    type: { type: DataTypes.ENUM('SALE','POST_SALE'), allowNull: false },
    telcoId: { type: DataTypes.INTEGER, field: 'telco_id' },
  }, {
    tableName: 'advisors',
    timestamps: false,
  });
  return Advisor;
};