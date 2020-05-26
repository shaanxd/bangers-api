const express = require('express');
const passport = require('passport');

const wrap = require('../error/wrap');
const passportConfig = require('../passport');
const adminController = require('../controllers/admin');
const checkAuth = require('../middleware/auth');
const upload = require('../util/upload');

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
  '/enable-user/:id',
  passport.authenticate('jwt', { session: false }),
  checkAuth.check_admin,
  wrap(adminController.enable_user)
);

router.post(
  '/update-booking',
  passport.authenticate('jwt', { session: false }),
  checkAuth.check_admin,
  wrap(adminController.update_booking)
);

router.post(
  '/add-equipment',
  passport.authenticate('jwt', { session: false }),
  checkAuth.check_admin,
  wrap(adminController.add_equipment)
);

router.post(
  '/add-vehicle-type',
  passport.authenticate('jwt', { session: false }),
  checkAuth.check_admin,
  wrap(adminController.add_vehicle_type)
);

router.post(
  '/add-vehicle',
  passport.authenticate('jwt', { session: false }),
  checkAuth.check_admin,
  upload('vehicles').fields([
    { name: 'defaultImage', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ]),
  wrap(adminController.add_vehicle)
);

module.exports = router;
