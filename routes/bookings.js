const express = require('express');
const passport = require('passport');

const bookingController = require('../controllers/bookings');
const passportConfig = require('../passport');

const router = express.Router();

router.post(
  '/create-booking',
  passport.authenticate('jwt', { session: false }),
  bookingController.create_booking
);

module.exports = router;
