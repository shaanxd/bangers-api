const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Vehicle = sequelize.define('vehicle', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  image: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Vehicle;
