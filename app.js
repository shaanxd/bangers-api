require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sendgridMail = require('@sendgrid/mail');

const { UserTypes } = require('./constants/UserTypes');

const sequelize = require('./util/database');

const userRoutes = require('./routes/User');

const User = require('./models/User');

const port = process.env.PORT || 3000;

const cors = require('./util/cors');

const app = express();

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors);

app.use('/api/users', userRoutes);

sequelize
  .sync({ force: false })
  /* .then(result => bcrypt.hash('12345', 10))
  .then(password =>
    User.create({
      username: 'shaanxd',
      email: 'shaahid.xd@gmail.com',
      password,
      userType: UserTypes.ADMIN_USER,
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
