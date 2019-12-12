const express = require('express');
const passport = require('passport');
const passportConfig = require('../passport');

const userController = require('../controllers/User');

const router = express.Router();

router.post('/login', userController.login_user);

router.post('/signup', userController.signup_user);

router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email']
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  userController.auth_google
);

router.get(
  '/facebook',
  passport.authenticate('facebook', {
    failureRedirect: '/login',
    session: false
  })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login',
    session: false
  }),
  userController.auth_facebook
);

module.exports = router;
