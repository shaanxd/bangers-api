const Sequelize = require('sequelize');

const CustomError = require('../error/error');

const { documentTypes } = require('../constants/documentTypes');
const { sendDmvMail } = require('../util/mail');
const { Booking, Vehicle, User, Equipment, BookedEquipment, VehicleType, Document, License } = require('../models');
const { calculateTotalPrice, getDifferenceInHours, getDifferenceInWeeks } = require('../util/booking');

const create_booking = async (req, res, next) => {
  const {
    user: { id: userId, license },
    body: { startDate, returnDate, vehicleId, equipment },
  } = req;
  if (!startDate || !returnDate || !vehicleId) {
    throw new CustomError(400, 'Bad Request');
  }
  const vehicle = await Vehicle.findOne({
    where: {
      id: vehicleId,
    },
    include: [{ model: VehicleType }],
  });
  if (!vehicle) {
    throw new CustomError(404, 'Vehicle not found.');
  }
  const userDocuments = await Document.findAll({
    where: {
      userId,
    },
  });
  if (userDocuments.length !== 2) {
    throw new CustomError(
      400,
      'You have not uploaded the required documents. Please upload the required documents and try again.'
    );
  }
  const isMissing = await License.findOne({
    where: {
      license,
    },
  });
  if (isMissing) {
    const userLicenseImage = userDocuments.filter((doc) => doc.type === documentTypes.DRIVING_LICENSE);
    if (userLicenseImage.length > 0) {
      sendDmvMail(license, userLicenseImage[0].img);
    }

    throw new CustomError(400, 'Your license has been reported as missing.');
  }

  if (getDifferenceInHours(startDate, returnDate) < 5) {
    throw new CustomError(400, 'Cannot book vehicles for less than 5 hours.');
  }
  if (getDifferenceInWeeks(startDate, returnDate) > 2) {
    throw new CustomError(400, 'Cannot book vehicles for more than two weeks.');
  }

  const foundBooking = await Booking.findAll({
    where: {
      [Sequelize.Op.and]: {
        startDate: {
          [Sequelize.Op.lte]: new Date(returnDate),
        },
        returnDate: {
          [Sequelize.Op.gte]: new Date(startDate),
        },
        vehicleId,
      },
    },
  });
  if (foundBooking.length !== 0) {
    throw new CustomError(400, 'Vehicle is booked during selected date');
  }
  const equipmentBooked = await Booking.findAll({
    where: {
      [Sequelize.Op.and]: {
        startDate: {
          [Sequelize.Op.lte]: new Date(returnDate),
        },
        returnDate: {
          [Sequelize.Op.gte]: new Date(startDate),
        },
      },
    },
    include: [
      {
        model: Equipment,
        where: {
          id: equipment,
        },
      },
    ],
  });
  if (equipmentBooked.length > 0) {
    throw new CustomError(400, `${equipmentBooked[0].equipment[0].name} is unavailable on selected date.`);
  }

  const {
    vehicleType: { pricePerDay },
  } = vehicle;

  const totalPrice = calculateTotalPrice(startDate, returnDate, pricePerDay);

  const booking = await Booking.create({
    startDate,
    returnDate,
    userId,
    vehicleId,
    totalPrice,
  });
  await booking.addEquipment(equipment);
  res.status(200).json({
    message: 'Vehicle booked successfully.',
  });
};

const get_equipment = async (req, res, next) => {
  const equipment = await Equipment.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
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
          [Sequelize.Op.lte]: new Date(returnDate),
        },
        returnDate: {
          [Sequelize.Op.gte]: new Date(foundBooking.startDate),
        },
        vehicleId: foundBooking.vehicleId,
      },
    },
  });
  if (existingCount > 1) {
    throw new CustomError(404, 'Vehicle is already booked for specified date and time.');
  }
  const existingEquipment = await foundBooking.getEquipment();
  if (existingEquipment.length > 0) {
    let equipmentIdArray = [];
    existingEquipment.forEach((equipment) => {
      equipmentIdArray.push(equipment.id);
    });
    const equipmentCount = await Booking.count({
      where: {
        [Sequelize.Op.and]: {
          startDate: {
            [Sequelize.Op.lte]: new Date(returnDate),
          },
          returnDate: {
            [Sequelize.Op.gte]: new Date(foundBooking.startDate),
          },
        },
      },
      include: [
        {
          model: Equipment,
          where: {
            id: equipmentIdArray,
          },
        },
      ],
    });
    if (equipmentCount !== existingEquipment.length) {
      throw new CustomError(400, 'Selected item have already been booked for specified date and time.');
    }
  }
  await foundBooking.update({
    returnDate,
  });
  res.status(200).json({
    message: 'Booking extended successfully!',
  });
};

const get_bookings = async (req, res, next) => {
  const {
    user: { id },
  } = req;
  const bookings = await Booking.findAll({
    where: { userId: id },
    attributes: { exclude: ['userId', 'createdAt', 'updatedAt', 'vehicleId'] },
    include: [
      { model: Vehicle, attributes: { exclude: ['createdAt', 'updatedAt', 'vehicleTypeId'] } },
      { model: Equipment, attributes: { exclude: ['createdAt', 'updatedAt'] } },
    ],
  });
  res.status(200).json(bookings);
};

const add_equipment = async (req, res, next) => {
  const { id, equipment } = req.body;

  if (!id || !equipment || equipment.length == 0) {
    throw new CustomError(400, 'Bad Request');
  }

  const booking = await Booking.findByPk(id);

  if (!booking) {
    throw new CustomError(400, 'Booking not found.');
  }

  const { returnDate, startDate } = booking;

  const bookedEquipment = await Booking.findAll({
    where: {
      [Sequelize.Op.and]: {
        startDate: {
          [Sequelize.Op.lte]: new Date(returnDate),
        },
        returnDate: {
          [Sequelize.Op.gte]: new Date(startDate),
        },
      },
    },
    include: [
      {
        model: Equipment,
        where: {
          id: equipment,
        },
      },
    ],
  });

  if (bookedEquipment.length > 0) {
    throw new CustomError(400, `${bookedEquipment[0].equipment[0].name} is unavailable on date of the booking.`);
  }
  await booking.addEquipment(equipment);
  res.status(200).json({
    message: 'Equipment added successfully.',
  });
};

module.exports = {
  create_booking,
  get_equipment,
  extend_booking,
  get_bookings,
  add_equipment,
};
