const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Document = sequelize.define('document', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false
  },
  img: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Document;
