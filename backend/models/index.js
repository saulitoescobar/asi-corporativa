const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Modelos
db.Company = require('./Company')(sequelize, DataTypes);
db.Position = require('./Position')(sequelize, DataTypes);
db.User = require('./User')(sequelize, DataTypes);
db.Plan = require('./Plan')(sequelize, DataTypes);
db.Advisor = require('./Advisor')(sequelize, DataTypes);
db.Telco = require('./Telco')(sequelize, DataTypes);
db.Line = require('./Line')(sequelize, DataTypes);
db.LegalRepresentative = require('./LegalRepresentative')(sequelize, DataTypes);
db.LegalRepCompanyPeriod = require('./LegalRepCompanyPeriod')(sequelize, DataTypes);

// Asociaciones (definir después de todos los modelos)
// Usuarios ↔ Companies, Positions
db.User.belongsTo(db.Company, { foreignKey: 'companyId', as: 'company' });
db.User.belongsTo(db.Position, { foreignKey: 'positionId', as: 'position' });
db.Company.hasMany(db.User, { foreignKey: 'companyId', as: 'users' });
db.Position.hasMany(db.User, { foreignKey: 'positionId', as: 'users' });

// Legal Representatives ↔ Companies (relación N:M a través de períodos)
db.LegalRepresentative.hasMany(db.LegalRepCompanyPeriod, { 
  foreignKey: 'legalRepresentativeId', 
  as: 'companyPeriods' 
});
db.Company.hasMany(db.LegalRepCompanyPeriod, { 
  foreignKey: 'companyId', 
  as: 'legalRepPeriods' 
});
db.LegalRepCompanyPeriod.belongsTo(db.LegalRepresentative, { 
  foreignKey: 'legalRepresentativeId', 
  as: 'legalRepresentative' 
});
db.LegalRepCompanyPeriod.belongsTo(db.Company, { 
  foreignKey: 'companyId', 
  as: 'company' 
});

// Relaciones Many-to-Many helpers
db.LegalRepresentative.belongsToMany(db.Company, {
  through: db.LegalRepCompanyPeriod,
  foreignKey: 'legalRepresentativeId',
  otherKey: 'companyId',
  as: 'companies'
});
db.Company.belongsToMany(db.LegalRepresentative, {
  through: db.LegalRepCompanyPeriod,
  foreignKey: 'companyId',
  otherKey: 'legalRepresentativeId',
  as: 'legalRepresentatives'
});

// Telcos ↔ Advisors
db.Advisor.belongsTo(db.Telco, { foreignKey: 'telcoId', as: 'telco' });
db.Telco.hasMany(db.Advisor, { foreignKey: 'telcoId', as: 'advisors' });
db.Telco.belongsTo(db.Advisor, { foreignKey: 'sales_advisor_id', as: 'salesAdvisor' });
db.Telco.belongsTo(db.Advisor, { foreignKey: 'post_sales_advisor_id', as: 'postSalesAdvisor' });

// Líneas ↔ User, Plan, Telco, Advisor
db.Line.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.Line.belongsTo(db.Plan, { foreignKey: 'plan_id', as: 'plan' });
db.Line.belongsTo(db.Telco, { foreignKey: 'telco_id', as: 'telco' });
db.Line.belongsTo(db.Advisor, { foreignKey: 'advisor_id', as: 'advisor' });
db.Plan.hasMany(db.Line, { foreignKey: 'plan_id', as: 'lines' });
db.Telco.hasMany(db.Line, { foreignKey: 'telco_id', as: 'lines' });
db.Advisor.hasMany(db.Line, { foreignKey: 'advisor_id', as: 'lines' });

module.exports = db;