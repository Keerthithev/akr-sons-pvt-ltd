const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { protect } = require('../middleware/auth');

// All routes are protected with admin authentication
router.use(protect);

// Get all suppliers with pagination and search
router.get('/', supplierController.getAllSuppliers);

// Get supplier statistics
router.get('/stats', supplierController.getSupplierStats);

// Get supplier by ID
router.get('/:id', supplierController.getSupplierById);

// Create new supplier
router.post('/', supplierController.createSupplier);

// Update supplier
router.put('/:id', supplierController.updateSupplier);

// Delete supplier
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router; 