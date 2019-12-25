const express = require('express');

const vehiclesController = require('../controllers/vehicles');

const router = express.Router();

router.get('/', vehiclesController.get_vehicles);

router.get('/vehicle-types', vehiclesController.get_vehicle_types);

router.get('/:id', vehiclesController.get_vehicle);

module.exports = router;
