const express = require('express');
const passport = require('passport');

const wrap = require('../error/wrap');
const passportConfig = require('../passport');
const adminController = require('../controllers/admin');
const checkAuth = require('../middleware/auth');

const router = express.Router();

router.get(
  '/get-users',
  passport.authenticate('jwt', { session: false }),
  checkAuth.check_admin,
  wrap(adminController.get_users)
);

router.get(
  '/get-bookings',
  passport.authenticate('jwt', { session: false }),
  checkAuth.check_admin,
  wrap(adminController.get_bookings)
);

router.post(
  '/disable-user/:id',
  passport.authenticate('jwt', { session: false }),
  checkAuth.check_admin,
  wrap(adminController.disable_user)
);

router.post(
  '/update-booking',
  passport.authenticate('jwt', { session: false }),
  checkAuth.check_admin,
  wrap(adminController.update_booking)
);

module.exports = router;
