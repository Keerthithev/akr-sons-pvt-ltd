const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  bulkImportCustomers,
  getCustomerStats
} = require('../controllers/customerController');

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/customers - Get all customers with pagination and search
router.get('/', getAllCustomers);

// GET /api/customers/stats - Get customer statistics
router.get('/stats', getCustomerStats);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', getCustomerById);

// POST /api/customers - Create new customer
router.post('/', createCustomer);

// POST /api/customers/bulk-import - Bulk import customers
router.post('/bulk-import', bulkImportCustomers);

// PUT /api/customers/:id - Update customer
router.put('/:id', updateCustomer);

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', deleteCustomer);

module.exports = router; 