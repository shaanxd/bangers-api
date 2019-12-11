const express = require('express');
const passport = require('passport');
const passportConfig = require('../passport');

const userController = require('../controllers/User');

const router = express.Router();

router.post('/login', userController.login_user);

router.post('/signup', userController.signup_user);

router.post(
  '/google',
  passport.authenticate('google-token', { session: false }),
  userController.google_auth
);

module.exports = router;
