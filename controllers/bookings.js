const Sequelize = require('sequelize');

const CustomError = require('../error/error');
const { Booking, Vehicle, User, Equipment, BookedEquipment } = require('../models');

const create_booking = async (req, res, next) => {
  const {
    user: { id: userId },
    body: { startDate, returnDate, vehicleId, equipment }
  } = req;
  if (!startDate || !returnDate || !vehicleId) {
    throw new CustomError(400, 'Bad Request');
  }
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) {
    throw new CustomError(404, 'Vehicle not found.');
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
    throw new CustomError(400, 'Vehicle is booked during selected date');
  }
  const equipmentBooked = await Booking.findAll({
    where: {
      [Sequelize.Op.and]: {
        startDate: {
          [Sequelize.Op.lte]: new Date(returnDate)
        },
        returnDate: {
          [Sequelize.Op.gte]: new Date(startDate)
        }
      }
    },
    include: [
      {
        model: Equipment,
        where: {
          id: equipment
        }
      }
    ]
  });
  if (equipmentBooked.length > 0) {
    throw new CustomError(400, `${equipmentBooked[0].equipment[0].name} is unavailable on selected date.`);
  }
  const booking = await Booking.create({
    startDate,
    returnDate,
    userId,
    vehicleId
  });
  const bookedEquipments = await booking.addEquipment(equipment);
  res.status(200).json({
    message: 'Vehicle booked successfully.'
  });
};

const get_equipment = async (req, res, next) => {
  const equipment = await Equipment.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    }
  });
  res.status(200).json(equipment);
};

const extend_booking = async (req, res, next) => {
  const { bookingId, returnDate } = req.body;
  const foundBooking = await Booking.findByPk(bookingId);
  if (!foundBooking) {
    throw new CustomError(404, 'Booking not found.');
  }
  const existingCount = await Booking.count({
    where: {
      [Sequelize.Op.and]: {
        startDate: {
          [Sequelize.Op.lte]: new Date(returnDate)
        },
        returnDate: {
          [Sequelize.Op.gte]: new Date(foundBooking.startDate)
        },
        vehicleId: foundBooking.vehicleId
      }
    }
  });
  if (existingCount > 1) {
    throw new CustomError(404, 'Vehicle is already booked for specified date and time.');
  }
  const existingEquipment = await foundBooking.getEquipment();
  if (existingEquipment.length > 0) {
    let equipmentIdArray = [];
    existingEquipment.forEach(equipment => {
      equipmentIdArray.push(equipment.id);
    });
    const equipmentCount = await Booking.count({
      where: {
        [Sequelize.Op.and]: {
          startDate: {
            [Sequelize.Op.lte]: new Date(returnDate)
          },
          returnDate: {
            [Sequelize.Op.gte]: new Date(foundBooking.startDate)
          }
        }
      },
      include: [
        {
          model: Equipment,
          where: {
            id: equipmentIdArray
          }
        }
      ]
    });
    if (equipmentCount !== existingEquipment.length) {
      throw new CustomError(400, 'Selected item have already been booked for specified date and time.');
    }
  }
  await foundBooking.update({
    returnDate
  });
  res.status(200).json({
    message: 'Booking extended successfully!'
  });
};

const get_bookings = async (req, res, next) => {
  const {
    user: { id }
  } = req;
  const bookings = await Booking.findAll({
    where: { userId: id },
    attributes: { exclude: ['userId', 'createdAt', 'updatedAt', 'vehicleId'] },
    include: [{ model: Vehicle, attributes: { exclude: ['createdAt', 'updatedAt', 'vehicleTypeId'] } }]
  });
  res.status(200).json(bookings);
};

module.exports = {
  create_booking,
  get_equipment,
  extend_booking,
  get_bookings
};
