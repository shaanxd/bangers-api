require('dotenv').config();

const { User, Vehicle, VehicleType } = require('./models');
const sequelize = require('./util/database');
const vehicles = require('./data/vehicles.js');

VehicleType.hasMany(Vehicle, {
  foreignKey: { name: 'vehicleTypeId', field: 'type' }
});
Vehicle.belongsTo(VehicleType);

const seedVehicles = () => {
  return VehicleType.bulkCreate(vehicles, { include: [Vehicle] });
};

sequelize
  .sync({ force: true })
  .then(result => {
    console.log('Bulk creating vehicles...');
    return seedVehicles();
  })
  .then(result => {
    console.log('Bulk creating vehicles complete.');
  })
  .catch(err => {
    console.log(err.message);
  });
