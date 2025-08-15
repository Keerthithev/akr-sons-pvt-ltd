const express = require('express');
const router = express.Router();
const bankDepositController = require('../controllers/bankDepositController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', bankDepositController.getAllBankDeposits);
router.get('/stats', bankDepositController.getBankDepositStats);
router.get('/:id', bankDepositController.getBankDepositById);
router.post('/', bankDepositController.createBankDeposit);
router.put('/:id', bankDepositController.updateBankDeposit);
router.delete('/:id', bankDepositController.deleteBankDeposit);
router.post('/bulk-import', bankDepositController.bulkImportBankDeposits);

module.exports = router; 