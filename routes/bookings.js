const express = require('express');
const passport = require('passport');

const wrap = require('../error/wrap');
const bookingController = require('../controllers/bookings');
const passportConfig = require('../passport');

const router = express.Router();

router.post(
  '/create-booking',
  passport.authenticate('jwt', { session: false }),
  wrap(bookingController.create_booking)
);

router.get('/equipment', wrap(bookingController.get_equipment));

router.post(
  '/extend-booking',
  passport.authenticate('jwt', { session: false }),
  wrap(bookingController.extend_booking)
);

router.get('/get-bookings', passport.authenticate('jwt', { session: false }), wrap(bookingController.get_bookings));

router.post('/add-equipment', passport.authenticate('jwt', { session: false }), wrap(bookingController.add_equipment));

module.exports = router;
