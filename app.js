require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sendgridMail = require('@sendgrid/mail');

const { userTypes } = require('./constants/authTypes');
const sequelize = require('./util/database');
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const { User, Vehicle, VehicleType } = require('./models');
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

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

sequelize
  .sync()
  .then(result => {
    app.listen(port, () => {
      console.log(
        `Connection to database successful. Server is listening at port ${port}`
      );
    });
  })
  .catch(err => {
    console.log(err.message);
  });
