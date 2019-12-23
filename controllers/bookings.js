const Sequelize = require('sequelize');

const { Booking, Vehicle, User, Equipment } = require('../models');

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
            [Sequelize.Op.lte]: new Date(returnDate)
          },
          returnDate: {
            [Sequelize.Op.gte]: new Date(startDate)
          },
          vehicleId
        }
      }
    });
    if (foundBooking.length !== 0) {
      return res.status(400).json({
        message: 'Vehicle booked during selected date.'
      });
    }
    const booking = await Booking.create({
      startDate,
      returnDate,
      userId,
      vehicleId
    });
    res.status(200).json({
      message: 'Vehicle booked successfully.'
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error. Please try again.'
    });
  }
};

const get_equipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });
    res.status(200).json(equipment);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error. Please try again.'
    });
  }
};

module.exports = {
  create_booking,
  get_equipment
};
