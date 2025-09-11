module.exports = (sequelize, DataTypes) => {
  const Telco = sequelize.define('Telco', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    salesAdvisorId: { type: DataTypes.INTEGER, field: 'sales_advisor_id' },
    postSalesAdvisorId: { type: DataTypes.INTEGER, field: 'post_sales_advisor_id' },
  }, {
    tableName: 'telcos',
    timestamps: false,
  });
  return Telco;
};