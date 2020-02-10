const { userTypes } = require('../constants/authTypes');
const CustomError = require('../error/error');

const check_admin = (req, res, next) => {
  if (req.user && req.user.userType === userTypes.ADMIN_USER) {
    next();
  } else {
    throw new CustomError(400, 'Unauthorized for selected route.');
  }
};

module.exports = {
  check_admin
};
