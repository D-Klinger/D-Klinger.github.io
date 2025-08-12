/**
 * Passport.js Local Authentication
 * Sets up the Passport LocalStrategy for user authentication via email and password.
 * Uses Mongoose to retrieve users from MongoDB, and checks passwords via methods in User model.
 */

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('users');

/**
 * Configure Passport using LocalStrategy
 * - 'usernameField' is set to 'email' for authentication to accept email as login
 * - Verifies the user's email and password
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email }).exec();
        if (!user) {
            return done(null, false, { 
                message: "Incorrect username."
            });
        }
        if (!user.validPassword(password)) {
            return done(null, false, { 
                message: "Incorrect password."
            });
        }
        return done(null, user);
      } catch (err) {
            return done(err);
      }
    }
  )
);

module.exports = passport;
