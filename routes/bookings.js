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

router.get('/equipment', bookingController.get_equipment);

module.exports = router;
