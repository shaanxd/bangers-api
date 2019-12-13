const express = require('express');

const vehiclesController = require('../controllers/vehicles');

const router = express.Router();

router.get('/', vehiclesController.get_vehicles);

router.get('/:id', vehiclesController.get_vehicle);

module.exports = router;
