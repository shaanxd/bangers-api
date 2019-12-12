const passport = require('passport');
const Sequelize = require('sequelize');
const { randomPassword, digits } = require('secure-random-password');
const bcrypt = require('bcrypt');
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const {
  generateAuthCallbackUrl,
  sendSignupMailWithPassword
} = require('./util/auth');
const { authTypes, userTypes } = require('./constants/authTypes');

const User = require('./models/User');

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  JWT_KEY
} = process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: generateAuthCallbackUrl(authTypes.GOOGLE_AUTH)
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
            userType: userTypes.CUSTOMER_USER,
            firstname,
            lastname,
            googleProvider
          });
          sendSignupMailWithPassword(email, generatedPassword);
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
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: generateAuthCallbackUrl(authTypes.FACEBOOK_AUTH),
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
            userType: userTypes.CUSTOMER_USER,
            firstname,
            lastname,
            facebookProvider
          });
          if (email) {
            sendSignupMailWithPassword(email, generatedPassword);
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

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_KEY
    },
    async (payload, done) => {
      try {
        const user = await User.findByPk(payload.id);
        if (!user) {
          return done(null, false);
        }
        done(null, user);
      } catch (err) {
        done(err, false);
      }
    }
  )
);
