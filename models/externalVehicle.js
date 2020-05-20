const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const ExternalVehicle = sequelize.define('externalVehicle', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  ratePerDay: {
    type: Sequelize.DOUBLE,
    defaultValue: 0.0,
  },
  ratePerWeek: {
    type: Sequelize.DOUBLE,
    defaultValue: 0.0,
  },
  over80Km: {
    type: Sequelize.DOUBLE,
    defaultValue: 0.0,
  },
});

module.exports = ExternalVehicle;
