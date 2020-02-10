const { User, Booking } = require('../models');
const { userTypes } = require('../constants/authTypes');
const CustomError = require('../error/error');

const get_bookings = async (req, res, next) => {
  const bookings = await Booking.findAll();
  res.status(200).json({
    bookings: [...bookings]
  });
};

const get_users = async (req, res, next) => {
  const users = await User.findAll({
    where: {
      userType: userTypes.CUSTOMER_USER
    },
    attributes: {
      exclude: ['facebookProvider', 'googleProvider', 'createdAt', 'updatedAt', 'password', 'userType']
    }
  });
  res.status(200).json({
    users: [...users]
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
    message: 'User disabled successfully!'
  });
};

const update_booking = async (req, res, next) => {
  const { id, status } = req.body;
  if (!id || !status) {
    throw new CustomError(400, 'Bad Request');
  }
  const booking = await User.findByPk(id);
  if (!booking) {
    throw new CustomError(404, 'Booking not found.');
  }
  await booking.update({ bookingStatus: status });
  res.status(200).json({
    message: 'Booking updated successfully!'
  });
};

module.exports = {
  get_users,
  get_bookings,
  disable_user,
  update_booking
};
