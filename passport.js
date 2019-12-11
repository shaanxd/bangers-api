const passport = require('passport');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const Sequelize = require('sequelize');
const { randomPassword, digits } = require('secure-random-password');
const bcrypt = require('bcrypt');

const { UserTypes } = require('./constants/UserTypes');

const User = require('./models/User');

passport.use(
  new GoogleTokenStrategy(
    {
      clientID:
        '711825979883-d9v96h3u0f9oj5jg1enn7ckvt58b6epr.apps.googleusercontent.com',
      clientSecret: '5NtJL48KX7_uDGZjlIoivV6f'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const {
          _json: {
            id: googleProvider,
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
