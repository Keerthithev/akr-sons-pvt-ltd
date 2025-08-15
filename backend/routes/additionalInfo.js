const express = require('express');
const router = express.Router();
const additionalInfoController = require('../controllers/additionalInfoController');
const { protect } = require('../middleware/auth');

// All routes are protected with admin authentication
router.use(protect);

// Get all additional info records with pagination and search
router.get('/', additionalInfoController.getAllAdditionalInfo);

// Get additional info statistics
router.get('/stats', additionalInfoController.getAdditionalInfoStats);

// Get additional info by ID
router.get('/:id', additionalInfoController.getAdditionalInfoById);

// Create new additional info record
router.post('/', additionalInfoController.createAdditionalInfo);

// Update additional info
router.put('/:id', additionalInfoController.updateAdditionalInfo);

// Delete additional info
router.delete('/:id', additionalInfoController.deleteAdditionalInfo);

module.exports = router; 