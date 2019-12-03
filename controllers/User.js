const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');

const User = require('../models/User');

const login_user = (req, res, next) => {
  const {
    body: { username, password }
  } = req;
  if (username && password) {
    User.findOne({
      where: {
        username
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'isBlackedListed']
      }
    })
      .then(foundUser => {
        if (foundUser) {
          bcrypt
            .compare(password, foundUser.password)
            .then(isValid => {
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
                  message: 'Authentication successful.',
                  userToken: jwToken
                });
              } else {
                res.status(401).json({
                  message: 'Invalid username or password'
                });
              }
            })
            .catch(err => {
              res.status(500).json({
                message: 'Internal server error. Please try again.'
              });
            });
        }
      })
      .catch(err => {
        res.status(500).json({
          message: 'Internal server error. Please try again.'
        });
      });
  } else {
    res.status(400).json({
      message: 'Bad Request.'
    });
  }
};

const signup_user = (req, res, next) => {
  const {
    body: { username, password, email }
  } = req;
  if (username && email && password) {
    User.findOne({
      where: {
        [Sequelize.Op.or]: [{ username }, { email }]
      }
    }).then(foundUser => {
      if (foundUser) {
        res.status(400).json({
          message: 'Username or Email already exists.'
        });
      } else {
        bcrypt
          .hash(password, 10)
          .then(hashedPassword => {
            return User.create({
              username,
              email,
              password: hashedPassword
            });
          })
          .then(createdUser => {
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
              message: 'Signup Successful.',
              userToken: jwToken
            });
          })
          .catch(err => {
            res.status(500).json({
              message: 'Internal server error. Please try again.'
            });
          });
      }
    });
  } else {
    res.status(400).json({
      message: 'Bad Request.'
    });
  }
};

module.exports = {
  login_user,
  signup_user
};
