const Sequelize = require('sequelize');

const { Booking, Vehicle, User } = require('../models');

const create_booking = async (req, res, next) => {
  try {
    const {
      user: { id: userId },
      body: { startDate, returnDate, vehicleId }
    } = req;
    if (!startDate || !returnDate || !vehicleId) {
      return res.status(401).json({
        message: 'Bad Request'
      });
    }
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        message: 'Vehicle not found'
      });
    }
    const foundBooking = await Booking.findAll({
      where: {
        [Sequelize.Op.and]: {
          startDate: {
            [Sequelize.Op.gte]: new Date(startDate)
          },
          returnDate: {
            [Sequelize.Op.lte]: new Date(returnDate)
          }
        }
      }
    });
    console.log(foundBooking);
    const createdBooking = Booking.create({
      startDate,
      returnDate,
      userId,
      vehicleId
    });
    res.status(200).json({
      message: 'ahaha'
    });
  } catch (err) {
    console.log(err.message);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error. Please try again.'
    });
  }
};

module.exports = {
  create_booking
};
