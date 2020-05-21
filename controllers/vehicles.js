const { Vehicle, VehicleType, ExternalVehicle } = require('../models');
const CustomError = require('../error/error');

const get_vehicles = async (req, res, next) => {
  const {
    query: { offset, type, limit },
  } = req;
  const whereClause = type
    ? {
        where: {
          type,
        },
      }
    : {};
  const vehicles = await Vehicle.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'vehicleTypeId', 'images'],
    },
    include: [
      {
        model: VehicleType,
        attributes: { exclude: ['createdAt', 'updatedAt', 'id'] },
      },
    ],
    limit: limit && !isNaN(parseInt(limit)) ? parseInt(limit) : 100,
    offset: offset && !isNaN(parseInt(offset)) ? parseInt(offset) : 0,
    ...whereClause,
  });
  res.status(200).json(vehicles);
};

const get_vehicle = async (req, res, next) => {
  const {
    params: { id },
  } = req;
  const vehicle = await Vehicle.findByPk(id, {
    attributes: { exclude: ['createdAt', 'updatedAt', 'vehicleTypeId'] },
    include: [
      {
        model: VehicleType,
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      },
    ],
  });
  if (!vehicle) {
    throw new CustomError(400, 'Vehicle not found.');
  }
  res.status(200).json(vehicle);
};

const get_vehicle_types = async (req, res, next) => {
  const vehicleTypes = await VehicleType.findAll();
  res.status(200).json(vehicleTypes);
};

const get_vehicle_comparisons = async (req, res, next) => {
  const externalVehicles = await ExternalVehicle.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
  });

  const bangersVehicles = await Vehicle.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'vehicleTypeId', 'images'],
    },
    include: [
      {
        model: VehicleType,
        attributes: { exclude: ['createdAt', 'updatedAt', 'id'] },
      },
    ],
  });

  res.status(200).json({
    external: [...externalVehicles],
    internal: [...bangersVehicles],
  });
};

module.exports = {
  get_vehicle,
  get_vehicles,
  get_vehicle_types,
  get_vehicle_comparisons,
};
