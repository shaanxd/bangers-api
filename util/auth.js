const jwt = require('jsonwebtoken');
const sendgridMail = require('@sendgrid/mail');

const { authTypes } = require('../constants/authTypes');

const { JWT_KEY, APP_HOST, PORT, CLIENT_BASE_URL } = process.env;

const generateJwToken = ({ id, userType }) => {
  return jwt.sign(
    {
      id,
      userType
    },
    JWT_KEY,
    {
      expiresIn: '1h'
    }
  );
};

const generateAuthRedirectUrl = (jwToken, userType) =>
  `${CLIENT_BASE_URL}authRedirect?token=${jwToken}&expiresIn=3600&type=${userType}`;

const generateAuthCallbackUrl = authType =>
  `http://${APP_HOST}:${PORT}/api/auth/${
    authType === authTypes.GOOGLE_AUTH ? 'google' : 'facebook'
  }/callback`;

const sendSignupMailWithPassword = (email, generatedPassword) => {
  sendgridMail
    .send({
      to: email,
      from: 'no-reply@bangers.com',
      subject: 'Signup successful!',
      html: `<div><h1>Thank you for signing up with bangers<h1><p>Your password is ${generatedPassword}</div>`
    })
    .then(result => {
      //  console.log(result);
    })
    .catch(err => {
      //  console.log(err);
    });
};

module.exports = {
  generateJwToken,
  generateAuthRedirectUrl,
  generateAuthCallbackUrl,
  sendSignupMailWithPassword
};
