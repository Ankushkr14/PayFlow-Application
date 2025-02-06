const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT, isAdmin } = require('../middlewares/authMiddleware');
const { validationRequest } = require('../middlewares/validationMiddleware');
const { 
  adminSchema,
  contactSchema,
  commonSchema 
} = require('../middlewares/schemaMiddleware');

router.use(authenticateJWT, isAdmin);


router.get('/users',validationRequest(commonSchema.pagination),adminController.getUser);
router.get('/users/:userId',validationRequest([commonSchema.idParam]),adminController.userDetail);
router.delete('/users/:userId', validationRequest([commonSchema.idParam]), adminController.deleteUser);
router.patch('/users/:userId/status', validationRequest([commonSchema.idParam, adminSchema.freezeAccount]), adminController.statusUpdate);

router.get('/transactions', validationRequest(commonSchema.pagination), adminController.getAllTransactions);
router.get('/transactions/:transactionId', validationRequest([commonSchema.idParam]), adminController.transactionById);
router.post('/transactions/:transactionId/reverse',validationRequest([commonSchema.idParam, adminSchema.reverseTransaction]),adminController.transactionReverse);

router.get('/contacts/:userId',validationRequest([commonSchema.idParam]),adminController.getUserContacts);
router.delete('/contacts/:userId/:contactId',validationRequest([commonSchema.idParam, contactSchema.create]),adminController.deleteUser);

router.get('/system/status',adminController.system);

module.exports = router;