/**
 * Main Route Index
 * Handles API routing for authentication and inventory endpoints.
 * Applies validation, JWT protection, and controller delegation.
 */

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authentication');
const inventoryRoutes = require('./inventory');
const authenticateJWT = require('../middleware/authenticationJWT');

/**
 * Validation Array: registerValidator
 * Validates required fields for new user registration.
 * - Ensures the prescence of all required user information.
 * - Password verified to have at least 8 chars, 1 upper, 1 lower, 1 digit, 1 special char.
 * - Email and phone number must be valid formats.
 */
const registerValidator = [
    check('userName').notEmpty().withMessage('Username is a required field'),
    check('firstName').notEmpty().withMessage('First name is a required field'),
    check('lastName').notEmpty().withMessage('Last name is a required field'),
    check('phoneNumber').notEmpty().isMobilePhone().withMessage('A valid phone number is required'),
    check('email').notEmpty().isEmail().withMessage('A valid email is a required'),
    check('password')
        .notEmpty()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 character in length')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character')
];

/**
 * Validation Array: loginValidator
 * Checks for valid email and non-empty password on login.
 */
const loginValidator = [
    check('email').notEmpty().isEmail().withMessage('A valid email is a required'),
    check('password').notEmpty().withMessage('Password is required'),
];

// Authication routes
router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.get('/me', authenticateJWT, authController.getMe);

// Inventory routes
router.use('/inventory', inventoryRoutes);

module.exports = router;