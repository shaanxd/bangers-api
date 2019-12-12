const passport = require('passport');
const Sequelize = require('sequelize');
const { randomPassword, digits } = require('secure-random-password');
const bcrypt = require('bcrypt');
const sendgridMail = require('@sendgrid/mail');
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');

const { UserTypes } = require('./constants/UserTypes');

const User = require('./models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://${process.env.APP_HOST}:${process.env.PORT}/api/users/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const {
          _json: {
            sub: googleProvider,
            email,
            given_name: firstname,
            family_name: lastname
          }
        } = profile;
        const user = await User.findOne({
          where: {
            [Sequelize.Op.or]: [{ email }, { googleProvider }]
          }
        });
        if (!user) {
          let username = `${firstname}${lastname}`.toLowerCase();
          const generatedPassword = randomPassword({
            length: 5,
            characters: digits
          });
          const isUsernameFound = await User.findOne({
            where: {
              username
            }
          });
          if (isUsernameFound) {
            username = `${username}${randomPassword({
              length: 4,
              characters: digits
            })}`;
          }
          const hashedPassword = await bcrypt.hash(generatedPassword, 10);
          const createdUser = await User.create({
            username,
            email,
            password: hashedPassword,
            userType: UserTypes.CUSTOMER_USER,
            firstname,
            lastname,
            googleProvider
          });
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
          return done(null, createdUser);
        }
        if (!user.googleProvider) {
          await user.update({ googleProvider });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `http://${process.env.APP_HOST}:${process.env.PORT}/api/users/facebook/callback`,
      profileFields: ['id', 'emails', 'name']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const {
          username: facebookUsername,
          _json: {
            id: facebookProvider,
            email,
            first_name: firstname,
            last_name: lastname
          }
        } = profile;
        const user = await User.findOne({
          where: {
            [Sequelize.Op.or]: [{ email }, { facebookProvider }]
          }
        });
        if (!user) {
          let username = facebookUsername
            ? facebookUsername
            : `${firstname}${lastname}`.toLowerCase();
          const generatedPassword = randomPassword({
            length: 5,
            characters: digits
          });
          const isUsernameFound = await User.findOne({
            where: {
              username
            }
          });
          if (isUsernameFound) {
            username = `${username}${randomPassword({
              length: 4,
              characters: digits
            })}`;
          }
          const hashedPassword = await bcrypt.hash(generatedPassword, 10);
          const createdUser = await User.create({
            username,
            email,
            password: hashedPassword,
            userType: UserTypes.CUSTOMER_USER,
            firstname,
            lastname,
            facebookProvider
          });
          if (email) {
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
          }
          return done(null, createdUser);
        }
        if (!user.facebookProvider) {
          await user.update({ facebookProvider });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
