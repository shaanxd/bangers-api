const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const VehicleType = sequelize.define('vehicleType', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false
  },
  pricePerDay: {
    type: Sequelize.DOUBLE,
    defaultValue: 0.0
  },
  numberOfSeats: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
});

module.exports = VehicleType;
