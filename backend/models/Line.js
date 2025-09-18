module.exports = (sequelize, DataTypes) => {
  const Line = sequelize.define('Line', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    lineNumber: { type: DataTypes.STRING, allowNull: false, unique: true, field: 'line_number' },
    status: { type: DataTypes.ENUM('ACTIVE','INACTIVE'), defaultValue: 'ACTIVE' },
    userId: { type: DataTypes.INTEGER, field: 'user_id', allowNull: true },
    planId: { type: DataTypes.INTEGER, field: 'plan_id', allowNull: true },
    telcoId: { type: DataTypes.INTEGER, field: 'telco_id', allowNull: true },
    advisorId: { type: DataTypes.INTEGER, field: 'advisor_id', allowNull: true },
    startDate: { type: DataTypes.DATE, field: 'start_date', allowNull: true },
    contractMonths: { type: DataTypes.INTEGER, field: 'contract_months', allowNull: true, defaultValue: 12 },
    renewalDate: { type: DataTypes.DATE, field: 'renewal_date', allowNull: true },
    assignmentDate: { type: DataTypes.DATE, field: 'assignment_date', allowNull: true },
    monthlyCost: { type: DataTypes.DECIMAL(10, 2), field: 'monthly_cost', allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'lines',
    timestamps: false,
  });
  return Line;
};