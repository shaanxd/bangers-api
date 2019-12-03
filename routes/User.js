const express = require('express');

const userController = require('../controllers/User');

const router = express.Router();

router.post('/login', userController.login_user);

router.post('/signup', userController.signup_user);

module.exports = router;
