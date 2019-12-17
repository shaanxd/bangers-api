require('dotenv').config();
const bcrypt = require('bcrypt');

const { User, Vehicle, VehicleType, Booking } = require('./models');
const sequelize = require('./util/database');
const vehicles = require('./data/vehicles.js');
const { userTypes } = require('./constants/authTypes');

VehicleType.hasMany(Vehicle, {
  foreignKey: { name: 'vehicleTypeId', field: 'type' }
});
Vehicle.belongsTo(VehicleType);
Booking.belongsTo(Vehicle);
Booking.belongsTo(User);

const seedVehicles = () => {
  return VehicleType.bulkCreate(vehicles, { include: [Vehicle] });
};

const seedUsers = password => {
  return User.create({
    username: 'shaanxd',
    email: 'shaahid.xd@gmail.com',
    password,
    userType: userTypes.ADMIN_USER,
    firstname: 'Shahid',
    lastname: 'Hassan'
  });
};

sequelize
  .sync({ force: true })
  .then(result => {
    console.log('Bulk creating vehicles...');
    return seedVehicles();
  })
  .then(result => {
    console.log('Bulk creating vehicles complete.');
    return bcrypt.hash('12345', 10);
  })
  .then(password => {
    console.log('Bulk creating users...');
    return seedUsers(password);
  })
  .then(result => {
    console.log('Bulk creating users complete.');
  })
  .catch(err => {
    console.log(err.message);
  });
