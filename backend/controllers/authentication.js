/**
 * Authentication Controller
 * Handles user registration, login with JWT, and a user profile retrieval.
 * Utilizes express-validator for input validation, and Passport.js for authentication.
 */

const mongoose = require('mongoose');
const User = require('../models/user');
const passport = require('passport');
const { validationResult } = require('express-validator');


/**
 * User Login Handler
 * Validates login request using express-validator.
 * Uses Passport.js 'local' strategy to authenticate user.
 * On success, returns a JWT token for client to use in requests.
 */
const login = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({ status: 'fail', errors: errors.array() });
    }
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            return res
                .status(404)
                .json({ status: 'fail', message: err.message || err });
        }
        if (user) {
            const token = user.generateJWT();
            res
                .status(200)
                .json({ status: 'success', token });
        } else {
            res
                .status(401)
                .json({ status: 'fail', message: info.message || 'Login failed' });
        }
  }) (req, res);
};

/**
 * User Registration Handler
 * Validates incoming registration request.
 * Checks for unique email and username in the database.
 * If unique, creates user, sets hashed password, and issues JWT.
 */
const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({ status: 'fail', errors: errors.array() });
    }

    try {
        const exists = await User.findOne({ email: req.body.email });
        if (exists) {
            return res
                .status(400)
                .json({ status: 'fail',  message: 'Email already in use' });
    }

        const existsUserName = await User.findOne({ userName: req.body.userName });
        if (existsUserName) {
            return res
                .status(400)
                .json({ status: 'fail', message: 'Username already in use' });
    }

    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        userName: req.body.userName,
        password: ''
    });
    user.setPassword(req.body.password);
    await user.save();

    const token = user.generateJWT();
    return res
            .status(200)
            .json({ status: 'success', token });
    } catch (err) {
        return res
            .status(400)
            .json({ status: 'fail', 'message': 'Registration failed', error: err.message || err });
    }
};

/**
 * Get Current Authenticated User Handler
 * Returns the user's own info except for password and Metadata froim Mongoose.
 * Expects a valid JWT.
 */
const getMe = async (req, res) => {
    try {
        const userId = req.auth && req.auth._id;
        if (!userId) {
            return res.status(401).json({ message: 'Unathorized' });
        }

        const user = await User.findById(userId).select('-password -__v');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server unable to handle request' })
    }
}

module.exports = {
  register,
  login,
  getMe
};