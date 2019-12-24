const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const BookedEquipment = sequelize.define('bookedEquipment', {});

module.exports = BookedEquipment;
