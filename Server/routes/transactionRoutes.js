const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/authMiddleware');
const { validationRequest } = require('../middlewares/validationMiddleware')
const { sendMoney, getHistory } = require('../controllers/transactionController');
const { transactionSchema, commonSchema } = require('../middlewares/schemaMiddleware');

router.use(authenticateJWT);

router.post('/send',validationRequest(transactionSchema.sendMoney), sendMoney);
router.get('/history', validationRequest(commonSchema.pagination),getHistory);

module.exports = router;