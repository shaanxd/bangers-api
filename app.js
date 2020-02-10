require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sendgridMail = require('@sendgrid/mail');

const { userTypes } = require('./constants/authTypes');
const sequelize = require('./util/database');
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/user');
const { User, Vehicle, VehicleType, Booking, Equipment, BookedEquipment, Document } = require('./models');
const cors = require('./util/cors');

const port = process.env.PORT || 3000;

const app = express();

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cors);

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
Document.belongsTo(User);
User.hasMany(Document);

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

sequelize
  .sync()
  .then(result => {
    app.listen(port, () => {
      console.log(`Connection to database successful. Server is listening at port ${port}`);
    });
  })
  .catch(err => {
    console.log(err.message);
  });
