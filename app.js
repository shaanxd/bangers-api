require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const sequelize = require('./util/database');

const userRoutes = require('./routes/User');

const User = require('./models/User');

const port = process.env.PORT || 3000;

const cors = require('./util/cors');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors);

app.use('/api/users', userRoutes);

sequelize.sync({ force: false }).then(result => {
  app.listen(port, () => {
    console.log(
      `Connection to database successful. Server is listening at port ${port}`
    );
  });
});
