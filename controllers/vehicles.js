const { Vehicle, VehicleType } = require('../models');

const get_vehicles = async (req, res, next) => {
  try {
    const {
      query: { offset, type, limit }
    } = req;
    const whereClause = type
      ? {
          where: {
            type
          }
        }
      : {};
    const vehicles = await Vehicle.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'vehicleTypeId', 'images']
      },
      include: [
        {
          model: VehicleType,
          attributes: { exclude: ['createdAt', 'updatedAt', 'id'] }
        }
      ],
      limit: limit && !isNaN(parseInt(limit)) ? parseInt(limit) : 100,
      offset: offset && !isNaN(parseInt(offset)) ? parseInt(offset) : 0,
      ...whereClause
    });
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error. Please try again.'
    });
  }
};

const get_vehicle = async (req, res, next) => {
  try {
    const {
      params: { id }
    } = req;
    const vehicle = await Vehicle.findByPk(id, {
      attributes: { exclude: ['createdAt', 'updatedAt', 'vehicleTypeId'] },
      include: [
        {
          model: VehicleType,
          attributes: { exclude: ['createdAt', 'updatedAt'] }
        }
      ]
    });
    if (!vehicle) {
      return res.status(404).json({
        message: 'Vehicle not found'
      });
    }
    res.status(200).json(vehicle);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error. Please try again.'
    });
  }
};

module.exports = {
  get_vehicle,
  get_vehicles
};
