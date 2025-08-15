const express = require('express');
const router = express.Router();
const serviceWarrantyController = require('../controllers/serviceWarrantyController');
const { protect } = require('../middleware/auth');

// All routes are protected with admin authentication
router.use(protect);

// Get all service warranty records with pagination and search
router.get('/', serviceWarrantyController.getAllServiceWarranty);

// Get service warranty statistics
router.get('/stats', serviceWarrantyController.getServiceWarrantyStats);

// Get service warranty by ID
router.get('/:id', serviceWarrantyController.getServiceWarrantyById);

// Create new service warranty record
router.post('/', serviceWarrantyController.createServiceWarranty);

// Update service warranty
router.put('/:id', serviceWarrantyController.updateServiceWarranty);

// Delete service warranty
router.delete('/:id', serviceWarrantyController.deleteServiceWarranty);

module.exports = router; 