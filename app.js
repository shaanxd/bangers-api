require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sendgridMail = require('@sendgrid/mail');

const { userTypes } = require('./constants/authTypes');
const sequelize = require('./util/database');
const authRoutes = require('./routes/auth');
const User = require('./models/users');
const cors = require('./util/cors');

const port = process.env.PORT || 3000;

const app = express();

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors);

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
  });
