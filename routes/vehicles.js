const express = require('express');

const wrap = require('../error/wrap');
const vehiclesController = require('../controllers/vehicles');

const router = express.Router();

router.get('/', wrap(vehiclesController.get_vehicles));

router.get('/vehicle-types', wrap(vehiclesController.get_vehicle_types));

router.get('/:id', wrap(vehiclesController.get_vehicle));

module.exports = router;
