const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');

const CustomError = require('../error/error');
const { userTypes } = require('../constants/authTypes');
const { User } = require('../models');
const { generateJwToken, generateAuthRedirectUrl } = require('../util/auth');

const login_user = async (req, res, next) => {
  const {
    body: { email, password }
  } = req;
  if (!email || !password) {
    throw new CustomError(400, 'Bad Request');
  }
  const foundUser = await User.findOne({
    where: {
      email
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'isBlackedListed']
    }
  });
  if (!foundUser) {
    throw new CustomError(400, "User doesn't exist");
  }
  const isValid = await bcrypt.compare(password, foundUser.password);
  if (!isValid) {
    throw new CustomError(401, 'Invalid credentials. Please try again.');
  }
  const jwToken = generateJwToken(foundUser);
  res.status(200).json({
    authToken: jwToken,
    expiresInSeconds: 3600,
    userType: foundUser.userType
  });
};

const signup_user = async (req, res, next) => {
  const {
    body: { password, email, firstname, lastname }
  } = req;
  if (!email || !password || !firstname || !lastname) {
    throw new CustomError(400, 'Bad Request');
  }
  const foundUser = await User.findOne({
    where: {
      email
    }
  });
  if (foundUser) {
    throw new CustomError(400, 'User with given email exists already.');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = await User.create({
    email,
    password: hashedPassword,
    userType: userTypes.CUSTOMER_USER,
    firstname,
    lastname
  });
  const jwToken = generateJwToken(createdUser);
  res.status(200).json({
    authToken: jwToken,
    expiresInSeconds: 3600,
    userType: createdUser.userType
  });
};

const auth_google = (req, res, next) => {
  const { user } = req;
  const jwToken = generateJwToken(user);
  const redirectUrl = generateAuthRedirectUrl(jwToken, user.userType);
  res.redirect(redirectUrl);
};

const auth_facebook = (req, res, next) => {
  const { user } = req;
  const jwToken = generateJwToken(user);
  const redirectUrl = generateAuthRedirectUrl(jwToken, user.userType);
  res.redirect(redirectUrl);
};

module.exports = {
  login_user,
  signup_user,
  auth_google,
  auth_facebook
};
