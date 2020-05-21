const insurance = require('../util/insurance');
const { QueryTypes } = require('sequelize');

const { User, Booking, Equipment, Vehicle } = require('../models');
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

module.exports = {
  get_users,
  get_bookings,
  disable_user,
  update_booking,
};
