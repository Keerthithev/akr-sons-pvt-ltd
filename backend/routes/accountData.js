const express = require('express');
const router = express.Router();
const accountDataController = require('../controllers/accountDataController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Get all account data with pagination and filtering
router.get('/', accountDataController.getAllAccountData);

// Get account data statistics
router.get('/stats', accountDataController.getAccountDataStats);

// Get single account data entry
router.get('/:id', accountDataController.getAccountDataById);

// Create new account data entry
router.post('/', accountDataController.createAccountData);

// Update account data entry
router.put('/:id', accountDataController.updateAccountData);

// Delete account data entry
router.delete('/:id', accountDataController.deleteAccountData);

// Bulk import account data
router.post('/bulk-import', accountDataController.bulkImportAccountData);

module.exports = router; 