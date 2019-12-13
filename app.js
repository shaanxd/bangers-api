require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sendgridMail = require('@sendgrid/mail');

const { userTypes } = require('./constants/authTypes');
const sequelize = require('./util/database');
const authRoutes = require('./routes/auth');
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

sequelize
  .sync({ force: false })
  /* .then(result => bcrypt.hash('12345', 10))
  .then(password =>
    User.create({
      username: 'shaanxd',
      email: 'shaahid.xd@gmail.com',
      password,
      userType: userTypes.ADMIN_USER,
      firstname: 'Shahid',
      lastname: 'Hassan'
    })
  ) */
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
