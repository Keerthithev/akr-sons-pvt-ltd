const express = require('express');
const router = express.Router();
const advancedCustomerController = require('../controllers/advancedCustomerController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Get all advanced customers with pagination and search
router.get('/', advancedCustomerController.getAdvancedCustomers);

// Get advanced customer by ID
router.get('/:id', advancedCustomerController.getAdvancedCustomerById);

// Create new advanced customer
router.post('/', advancedCustomerController.createAdvancedCustomer);

// Update advanced customer
router.put('/:id', advancedCustomerController.updateAdvancedCustomer);

// Delete advanced customer
router.delete('/:id', advancedCustomerController.deleteAdvancedCustomer);

// Get advanced customer statistics
router.get('/stats/overview', advancedCustomerController.getAdvancedCustomerStats);

// Get available bike models
router.get('/bikes/models', advancedCustomerController.getAvailableBikeModels);

// Get available bike colors
router.get('/bikes/colors', advancedCustomerController.getAvailableBikeColors);

// Get bike models with colors
router.get('/bikes/models-with-colors', advancedCustomerController.getBikeModelsWithColors);

module.exports = router; 