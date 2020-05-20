const Sequelize = require('sequelize').Sequelize;

const { AOSI_DB_NAME, AOSI_DB_USERNAME, AOSI_DB_PASSWORD, AOSI_DB_HOST, AOSI_DB_DIALECT } = process.env;

const insurance = new Sequelize(AOSI_DB_NAME, AOSI_DB_USERNAME, AOSI_DB_PASSWORD, {
  host: AOSI_DB_HOST,
  dialect: AOSI_DB_DIALECT,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
});

module.exports = insurance;
