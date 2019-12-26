const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');

const { userTypes } = require('../constants/authTypes');
const { User } = require('../models');
const { generateJwToken, generateAuthRedirectUrl } = require('../util/auth');

const login_user = async (req, res, next) => {
  const {
    body: { email, password }
  } = req;
  try {
    if (!email || !password) {
      return res.status(400).json({
        message: 'Bad Request.'
      });
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
      return res.status(400).json({
        message: "Email doesn't exist"
      });
    }
    const isValid = await bcrypt.compare(password, foundUser.password);
    if (!isValid) {
      return res.status(401).json({
        message: 'Invalid password'
      });
    }
    const jwToken = generateJwToken(foundUser);
    res.status(200).json({
      authToken: jwToken,
      expiresInSeconds: 3600,
      userType: foundUser.userType
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error. Please try again.'
    });
  }
};

const signup_user = async (req, res, next) => {
  const {
    body: { password, email, firstname, lastname }
  } = req;
  try {
    if (!email || !password || !firstname || !lastname) {
      return res.status(400).json({
        message: 'Bad Request'
      });
    }
    const foundUser = await User.findOne({
      where: {
        email
      }
    });
    if (foundUser) {
      return res.status(400).json({
        message: 'Email already exists.'
      });
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
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error. Please try again.'
    });
  }
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
