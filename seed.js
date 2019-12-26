require('dotenv').config();
const bcrypt = require('bcrypt');

const {
  User,
  Vehicle,
  VehicleType,
  Booking,
  BookedEquipment,
  Equipment
} = require('./models');
const sequelize = require('./util/database');
const vehicles = require('./data/vehicles');
const equipment = require('./data/equipment');
const { userTypes } = require('./constants/authTypes');

VehicleType.hasMany(Vehicle, {
  foreignKey: { name: 'vehicleTypeId', field: 'type' }
});
Vehicle.belongsTo(VehicleType);
Booking.belongsTo(Vehicle);
Booking.belongsTo(User);
Equipment.belongsToMany(Booking, {
  through: BookedEquipment,
  foreignKey: 'equipment'
});
Booking.belongsToMany(Equipment, {
  through: BookedEquipment,
  foreignKey: 'booking'
});

const seedVehicles = () => {
  return VehicleType.bulkCreate(vehicles, { include: [Vehicle] });
};

const seedEquipment = () => {
  return Equipment.bulkCreate(equipment);
};

const seedUsers = password => {
  return User.create({
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
    console.log('Bulk creating equipment');
    return seedEquipment();
  })
  .then(result => {
    console.log('Bulk creating equipment complete');
  })
  .catch(err => {
    console.log(err.message);
  });
