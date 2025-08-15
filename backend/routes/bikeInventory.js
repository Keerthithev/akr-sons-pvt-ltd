const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllBikeInventory,
  getBikeInventoryById,
  getBikeInventoryDropdownData,
  createBikeInventory,
  updateBikeInventory,
  deleteBikeInventory,
  bulkImportBikeInventory,
  getBikeInventoryStats
} = require('../controllers/bikeInventoryController');

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/bike-inventory - Get all bike inventory with pagination and search
router.get('/', getAllBikeInventory);

// GET /api/bike-inventory/stats - Get bike inventory statistics
router.get('/stats', getBikeInventoryStats);

// GET /api/bike-inventory/dropdown-data - Get dropdown data for form
router.get('/dropdown-data', getBikeInventoryDropdownData);

// GET /api/bike-inventory/:id - Get bike inventory by ID
router.get('/:id', getBikeInventoryById);

// POST /api/bike-inventory - Create new bike inventory
router.post('/', createBikeInventory);

// POST /api/bike-inventory/bulk-import - Bulk import bike inventory
router.post('/bulk-import', bulkImportBikeInventory);

// PUT /api/bike-inventory/:id - Update bike inventory
router.put('/:id', updateBikeInventory);

// DELETE /api/bike-inventory/:id - Delete bike inventory
router.delete('/:id', deleteBikeInventory);

module.exports = router; 