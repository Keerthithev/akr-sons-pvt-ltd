const express = require('express');
const router = express.Router();
const installmentPlanController = require('../controllers/installmentPlanController');
const { protect } = require('../middleware/auth');

// All routes are protected with admin authentication
router.use(protect);

// Get all installment plans with pagination and search
router.get('/', installmentPlanController.getAllInstallmentPlans);

// Get installment plan statistics
router.get('/stats', installmentPlanController.getInstallmentPlanStats);

// Get installment plan by ID
router.get('/:id', installmentPlanController.getInstallmentPlanById);

// Create new installment plan
router.post('/', installmentPlanController.createInstallmentPlan);

// Update installment plan
router.put('/:id', installmentPlanController.updateInstallmentPlan);

// Delete installment plan
router.delete('/:id', installmentPlanController.deleteInstallmentPlan);

module.exports = router; 