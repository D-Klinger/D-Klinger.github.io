/**
 * Inventory Routes
 * Handles all CRUD operations for inventory items.
 * Routes are protected by JWT authentication.
 * Input validation performed with express-validator.
 */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const InventoryItem = require('../models/InventoryItem');
const authenticateJWT = require('../middleware/authenticationJWT');

// Protects all inventory routes
router.use(authenticateJWT);

/**
 * Validation Array: inventoryValidator
 * Validates the incoming data for creation and update of items.
 */
const inventoryValidator = [
  check('name').notEmpty().withMessage('Name is required'),
  check('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  check('price').optional().isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  check('perishable').optional().isBoolean().withMessage('Perishable must be true or false'),
  check('expirationDate').optional().isISO8601().withMessage('Expiration date must be a valid date'),
  check('reorderThreshold').optional().isInt({ min: 0 }).withMessage('Reorder threshold must be non-negative')
];

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await InventoryItem.find();
    res
      .status(200)
      .json({ status: 'success', items });
  } catch (err) {
    res
      .status(500)
      .json({ status: 'fail', message: 'Unable to retrieve items', error: err.message });
  }
});

// Add item
router.post('/', inventoryValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ status: 'fail', errors: errors.array() });
  }
  try {
    const newItem = new InventoryItem(req.body);
    const savedItem = await newItem.save();
    res
      .status(201)
      .json({ status: 'success', item: savedItem });
  } catch (err) {
      res
        .status(400)
        .json({ status: 'fail', message: 'Item could not be added', error: err.message });
  }
});

// Update item
router.put('/:id', inventoryValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ status: 'fail', errors: errors.array() });
  }
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) {
      return res
        .status(404)
        .json({  status: 'fail', message: 'Item not found'  })
    }
    res
      .status(200)
      .json({ status: 'success', item });
  } catch (err) {
      res
        .status(400)
        .json({ status: 'fail', message: 'Unable to update item', error: err.message })
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try { 
    const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Item not found' });
    }
    res
      .status(200)
      .json({ status: 'success', message: 'Item deleted' });
  } catch (err) {
      res
      .status(400)
      .json({ status: 'fail', message: 'Error on deletion request', error: err.message });
  }
});

module.exports = router;