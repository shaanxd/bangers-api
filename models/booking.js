const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const { bookingStatus } = require('../constants/bookingTypes');

const Booking = sequelize.define('booking', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  startDate: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  returnDate: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  bookingStatus: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: bookingStatus.BOOKED,
  },
  totalPrice: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
});

module.exports = Booking;
