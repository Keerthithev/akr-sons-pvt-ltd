const express = require('express');
const router = express.Router();
const vehicleAllocationCouponController = require('../controllers/vehicleAllocationCouponController');
const { protect } = require('../middleware/auth');

// All routes are protected with admin authentication
router.use(protect);

// Get all vehicle allocation coupons with pagination and search
router.get('/', vehicleAllocationCouponController.getAllVehicleAllocationCoupons);

// Get vehicle allocation coupon statistics
router.get('/stats', vehicleAllocationCouponController.getVehicleAllocationCouponStats);

// Get cheque release reminders
router.get('/cheque-reminders', vehicleAllocationCouponController.getChequeReleaseReminders);

// Mark cheque as released
router.put('/cheque-reminders/:couponId/mark-released', vehicleAllocationCouponController.markChequeAsReleased);

// Get dropdown data for vehicle allocation coupon form
router.get('/dropdown-data', vehicleAllocationCouponController.getVehicleAllocationCouponDropdownData);

// Get vehicle allocation coupon by ID
router.get('/:id', vehicleAllocationCouponController.getVehicleAllocationCouponById);

// Create new vehicle allocation coupon
router.post('/', vehicleAllocationCouponController.createVehicleAllocationCoupon);

// Update vehicle allocation coupon
router.put('/:id', vehicleAllocationCouponController.updateVehicleAllocationCoupon);

// Delete vehicle allocation coupon
router.delete('/:id', vehicleAllocationCouponController.deleteVehicleAllocationCoupon);

module.exports = router; 