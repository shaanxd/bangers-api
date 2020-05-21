const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const License = sequelize.define('license', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  license: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = License;
