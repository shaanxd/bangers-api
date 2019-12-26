const express = require('express');
const passport = require('passport');

const upload = require('../util/upload');
const userController = require('../controllers/user');
const passportConfig = require('../passport');

const router = express.Router();

router.post(
  '/upload-document',
  passport.authenticate('jwt', { session: false }),
  upload.single('document'),
  userController.add_document
);

module.exports = router;
