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
  defaultImage: {
    type: Sequelize.STRING,
    allowNull: false
  },
  images: {
    type: Sequelize.STRING,
    allowNull: false,
    set(images) {
      this.setDataValue('images', images.join('?'));
    },
    get() {
      return this.getDataValue('images').split('?');
    }
  }
});

module.exports = Vehicle;
