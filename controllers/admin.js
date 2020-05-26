const insurance = require('../util/insurance');
const {
  QueryTypes,
  Op: { like },
} = require('sequelize');

const { User, Booking, Equipment, Vehicle, VehicleType } = require('../models');
const { userTypes } = require('../constants/authTypes');
const { bookingStatus } = require('../constants/bookingTypes');
const CustomError = require('../error/error');

const get_bookings = async (req, res, next) => {
  const bookings = await Booking.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
    include: [
      {
        model: Vehicle,
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
      {
        model: User,
        attributes: {
          exclude: ['facebookProvider', 'googleProvider', 'createdAt', 'updatedAt', 'password', 'userType'],
        },
      },
      {
        model: Equipment,
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
    ],
  });
  res.status(200).json({
    bookings: [...bookings],
  });
};

const get_users = async (req, res, next) => {
  const users = await User.findAll({
    where: {
      userType: userTypes.CUSTOMER_USER,
    },
    attributes: {
      exclude: ['facebookProvider', 'googleProvider', 'createdAt', 'updatedAt', 'password', 'userType'],
    },
  });
  res.status(200).json({
    users: [...users],
  });
};

const disable_user = async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) {
    throw new CustomError(404, 'User not found.');
  }
  if (user.isBlackListed) {
    throw new CustomError(400, 'User is already disabled');
  }
  await user.update({ isBlackListed: true });
  res.status(200).json({
    message: 'User disabled successfully!',
  });
};

const enable_user = async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) {
    throw new CustomError(404, 'User not found.');
  }
  if (!user.isBlackListed) {
    throw new CustomError(400, 'User is already enabled');
  }
  await user.update({ isBlackListed: false });
  res.status(200).json({
    message: 'User enabled successfully!',
  });
};

const update_booking = async (req, res, next) => {
  const { id, status } = req.body;

  if (!id || !status) {
    throw new CustomError(400, 'Bad Request');
  }

  let newStatus = status;

  const booking = await Booking.findByPk(id);
  if (!booking) {
    throw new CustomError(404, 'Booking not found.');
  }
  const user = await booking.getUser();

  const licenseList = await insurance.query(`SELECT * FROM frauds WHERE license='${user.license}'`, {
    raw: false,
    type: QueryTypes.SELECT,
  });

  if (licenseList.length > 0) {
    newStatus = bookingStatus.FAILED;
  }

  await booking.update({ bookingStatus: newStatus });

  if (newStatus === bookingStatus.FAILED) {
    await user.update({ isBlackListed: true });
  }

  res.status(200).json({
    message: 'Booking updated successfully!',
  });
};

const add_equipment = async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    throw new CustomError(400, 'Bad Request');
  }

  const equipment = await Equipment.findAll({
    where: {
      name: {
        [like]: name,
      },
    },
  });

  if (equipment.length > 0) {
    throw new CustomError(400, 'Equipment with given name already exists.');
  }

  await Equipment.create({
    name,
  });

  res.status(200).json({
    message: 'Equipment added successfully!',
  });
};

const add_vehicle_type = async (req, res, next) => {
  const { type, pricePerDay, numberOfSeats } = req.body;

  if (!type || !pricePerDay || !numberOfSeats) {
    throw new CustomError(400, 'Bad Request');
  }

  const existingType = await VehicleType.findAll({
    where: {
      type: {
        [like]: type,
      },
    },
  });

  if (existingType.length > 0) {
    throw new CustomError(400, 'Vehicle type with given name already exists.');
  }

  await VehicleType.create({
    type,
    pricePerDay,
    numberOfSeats,
  });

  res.status(200).json({
    message: 'Vehicle type created successfully!',
  });
};

const add_vehicle = async (req, res, next) => {
  const {
    files: { defaultImage: defaultArray, images: imageArray },
    body: { name, type },
  } = req;

  if (!name || !type || !defaultArray || !imageArray || defaultArray.length == 0 || imageArray.length < 3) {
    throw new CustomError(400, 'Bad Request');
  }

  const vehicleType = await VehicleType.findByPk(type);

  if (!vehicleType) {
    throw new CustomError(400, 'Vehicle type not found.');
  }

  const defaultImage = `/images/vehicles/${defaultArray[0].filename}`;
  const images = imageArray.map((image) => `/images/vehicles/${image.filename}`);

  await Vehicle.create({
    name,
    vehicleTypeId: type,
    defaultImage,
    images,
  });

  res.status(200).json({
    message: 'Vehicle created successfully!',
  });
};

module.exports = {
  get_users,
  get_bookings,
  disable_user,
  enable_user,
  update_booking,
  add_equipment,
  add_vehicle_type,
  add_vehicle,
};
