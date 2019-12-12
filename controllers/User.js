const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');

const { UserTypes } = require('../constants/UserTypes');
const User = require('../models/User');

const login_user = async (req, res, next) => {
  const {
    body: { username, password }
  } = req;
  try {
    if (!username || !password) {
      return res.status(400).json({
        message: 'Bad Request.'
      });
    }
    const foundUser = await User.findOne({
      where: {
        username
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'isBlackedListed']
      }
    });
    if (foundUser) {
      const isValid = await bcrypt.compare(password, foundUser.password);
      if (isValid) {
        const jwToken = jwt.sign(
          {
            id: foundUser.id,
            userType: foundUser.UserType
          },
          process.env.JWT_KEY,
          {
            expiresIn: '1h'
          }
        );
        res.status(200).json({
          authToken: jwToken,
          expiresInSeconds: 3600,
          userType: foundUser.userType
        });
      } else {
        res.status(401).json({
          message: 'Invalid username or password'
        });
      }
    } else {
      res.status(401).json({
        message: 'Invalid username or password'
      });
    }
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error. Please try again.'
    });
  }
};

const signup_user = async (req, res, next) => {
  const {
    body: { username, password, email, firstname, lastname }
  } = req;
  try {
    if (!username || !email || !password || !firstname || !lastname) {
      return res.status(400).json({
        message: 'Bad Request'
      });
    }
    const foundUser = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ username }, { email }]
      }
    });
    if (foundUser) {
      return res.status(400).json({
        message: 'Username or Email already exists.'
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      username,
      email,
      password: hashedPassword,
      userType: UserTypes.CUSTOMER_USER,
      firstname,
      lastname
    });
    const jwToken = jwt.sign(
      {
        id: createdUser.id,
        userType: createdUser.userType
      },
      process.env.JWT_KEY,
      {
        expiresIn: '1h'
      }
    );
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
  const {
    user: { id, userType }
  } = req;
  const jwToken = jwt.sign(
    {
      id,
      userType
    },
    process.env.JWT_KEY,
    {
      expiresIn: '1h'
    }
  );
  res.redirect(
    `${process.env.CLIENT_BASE_URL}authRedirect?token=${jwToken}&expiresIn=3600&type=${userType}`
  );
};

const auth_facebook = (req, res, next) => {
  const {
    user: { id, userType }
  } = req;
  const jwToken = jwt.sign(
    {
      id,
      userType
    },
    process.env.JWT_KEY,
    {
      expiresIn: '1h'
    }
  );
  res.redirect(
    `${process.env.CLIENT_BASE_URL}authRedirect?token=${jwToken}&expiresIn=3600&type=${userType}`
  );
};

module.exports = {
  login_user,
  signup_user,
  auth_google,
  auth_facebook
};
