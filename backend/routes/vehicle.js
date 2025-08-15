const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// List all vehicles (no company filter)
router.get('/', vehicleController.listAllVehicles);
// List all vehicles for a company
router.get('/company/:companyId', vehicleController.listVehicles);
// Add a vehicle to a company
router.post('/company/:companyId', vehicleController.uploadBrochure, vehicleController.addVehicle);
// Get vehicle details
router.get('/:vehicleId', vehicleController.getVehicle);
// Add this route for updating a vehicle
router.patch('/:vehicleId', vehicleController.uploadBrochure, vehicleController.updateVehicle);
// Add this route for updating vehicle availability only
router.patch('/:vehicleId/availability', vehicleController.updateVehicleAvailability);
// Add this route for updating stock quantity
router.patch('/:vehicleId/stock', vehicleController.updateStockQuantity);
// Add this route for deleting a vehicle
router.delete('/:vehicleId', vehicleController.deleteVehicle);

module.exports = router; 