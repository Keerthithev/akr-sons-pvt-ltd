const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllSalesTransactions,
  getSalesTransactionById,
  createSalesTransaction,
  updateSalesTransaction,
  deleteSalesTransaction,
  getSalesTransactionStats,
  bulkImportSalesTransactions
} = require('../controllers/salesTransactionController');

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/sales-transactions - Get all sales transactions with pagination and search
router.get('/', getAllSalesTransactions);

// GET /api/sales-transactions/stats - Get sales transaction statistics
router.get('/stats', getSalesTransactionStats);

// GET /api/sales-transactions/:id - Get sales transaction by ID
router.get('/:id', getSalesTransactionById);

// POST /api/sales-transactions - Create new sales transaction
router.post('/', createSalesTransaction);

// POST /api/sales-transactions/bulk-import - Bulk import sales transactions
router.post('/bulk-import', bulkImportSalesTransactions);

// PUT /api/sales-transactions/:id - Update sales transaction
router.put('/:id', updateSalesTransaction);

// DELETE /api/sales-transactions/:id - Delete sales transaction
router.delete('/:id', deleteSalesTransaction);

module.exports = router; 