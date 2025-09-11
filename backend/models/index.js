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

// Asociaciones (definir después de todos los modelos)
// Usuarios ↔ Companies, Positions
db.User.belongsTo(db.Company, { foreignKey: 'company_id', as: 'company' });
db.User.belongsTo(db.Position, { foreignKey: 'position_id', as: 'position' });
db.Company.hasMany(db.User, { foreignKey: 'company_id', as: 'users' });
db.Position.hasMany(db.User, { foreignKey: 'position_id', as: 'users' });

// Companies ↔ Legal Representatives
db.Company.hasMany(db.LegalRepresentative, { 
  foreignKey: 'companyId', 
  as: 'legalRepresentatives' 
});
db.LegalRepresentative.belongsTo(db.Company, { 
  foreignKey: 'companyId', 
  as: 'company' 
});

// Telcos ↔ Advisors
db.Advisor.belongsTo(db.Telco, { foreignKey: 'telco_id', as: 'telco' });
db.Telco.belongsTo(db.Advisor, { foreignKey: 'sales_advisor_id', as: 'salesAdvisor' });
db.Telco.belongsTo(db.Advisor, { foreignKey: 'post_sales_advisor_id', as: 'postSalesAdvisor' });
db.Advisor.hasMany(db.Telco, { foreignKey: 'sales_advisor_id', as: 'salesTelcos' });
db.Advisor.hasMany(db.Telco, { foreignKey: 'post_sales_advisor_id', as: 'postSalesTelcos' });

// Líneas ↔ User, Plan, Telco
db.Line.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.Line.belongsTo(db.Plan, { foreignKey: 'plan_id', as: 'plan' });
db.Line.belongsTo(db.Telco, { foreignKey: 'telco_id', as: 'telco' });
db.Plan.hasMany(db.Line, { foreignKey: 'plan_id', as: 'lines' });
db.Telco.hasMany(db.Line, { foreignKey: 'telco_id', as: 'lines' });

module.exports = db;