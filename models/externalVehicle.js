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
  ratePerMonth: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  ratePerWeek: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  over80Km: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
});

module.exports = ExternalVehicle;
