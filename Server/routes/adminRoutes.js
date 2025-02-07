const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT, isAdmin } = require('../middlewares/authMiddleware');
const { validationRequest } = require('../middlewares/validationMiddleware');
const { 
  adminSchema,
  commonSchema, 
  transactionSchema
} = require('../middlewares/schemaMiddleware');

router.use(authenticateJWT);
router.use(isAdmin)


router.get('/users',validationRequest(commonSchema.pagination),adminController.getUser);
router.get('/users/:userId',validationRequest([commonSchema.idParam]),adminController.userDetail);
router.delete('/users/:userId', validationRequest([commonSchema.idParam]), adminController.deleteUser);
router.patch('/users/:userId/status', validationRequest([commonSchema.idParam, adminSchema.freezeAccount]), adminController.statusUpdate);
router.post('/balance/:userId',validationRequest([commonSchema.idParam, commonSchema.balance]),adminController.updatebalance);

router.get('/transactions', validationRequest(commonSchema.pagination), adminController.getAllTransactions);
router.get('/transactions/:transactionId', validationRequest([transactionSchema.transactionId]), adminController.transactionById);
router.post('/transactions/:transactionId/reverse',validationRequest([adminSchema.reverseBalance]),adminController.transactionReverse);

router.get('/contacts/:userId',validationRequest([commonSchema.idParam]),adminController.getUserContacts);

router.get('/system/status',adminController.system);

module.exports = router;