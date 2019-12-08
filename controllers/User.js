const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');

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
            email: foundUser.email,
            username: foundUser.username
          },
          process.env.JWT_KEY,
          {
            expiresIn: '1h'
          }
        );
        res.status(200).json({
          authToken: jwToken
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
    body: { username, password, email }
  } = req;
  try {
    if (!username || !email || !password) {
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
      password: hashedPassword
    });
    const jwToken = jwt.sign(
      {
        id: createdUser.id,
        email: createdUser.email,
        username: createdUser.username
      },
      process.env.JWT_KEY,
      {
        expiresIn: '1h'
      }
    );
    res.status(200).json({
      authToken: jwToken
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error. Please try again.'
    });
  }
};

module.exports = {
  login_user,
  signup_user
};
