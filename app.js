require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');

const port = process.env.PORT || 3000;

const cors = require('./util/cors');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors);

app.use((req, res, next) => {});

sequelize.sync().then(result => {
  app.listen(port, () => {
    console.log(
      `Connection to database successful. Server is listening at port ${port}`
    );
  });
});
