const express = require('express');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const { getProfile, contactDetails, getContactTransactionHistory, changePIN, changePassword, deleteContact, createNewContact, getTransactionDetails } = require('../controllers/userController');
const { validationRequest } = require('../middlewares/validationMiddleware');
const { commonSchema, authSchema, contactSchema } = require('../middlewares/schemaMiddleware');
const router = express.Router();

router.put('/profile/password',validationRequest([authSchema.passwordChange]),changePassword);

router.use(authenticateJWT);

router.get('/profile', getProfile);
router.get('/transactions', getTransactionDetails);
router.get('/contacts', contactDetails);
router.get('/contact/:contactId',validationRequest([commonSchema.idParam]),getContactTransactionHistory);

router.put('/profile/pin-reset',validationRequest([authSchema.pinChange]),changePIN);
router.delete('/delete-contact',validationRequest([contactSchema.create]),deleteContact);
router.post('/newcontact',validationRequest([contactSchema.create]),createNewContact);

module.exports = router;