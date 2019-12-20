const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const BookEquipment = sequelize.define('bookEquipment', {});

module.exports = BookEquipment;
