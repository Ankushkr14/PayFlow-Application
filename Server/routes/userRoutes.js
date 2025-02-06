const express = require('express');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const { getProfile, contactDetails, getContactTransactionHistory, changePIN, changePassword, deleteContact, createNewContact } = require('../controllers/userController');
const { validationRequest } = require('../middlewares/validationMiddleware');
const { commonSchema, authSchema, contactSchema } = require('../middlewares/schemaMiddleware');
const router = express.Router();


router.use(authenticateJWT);

router.get('/profile', getProfile);
router.get('/contacts', contactDetails);
router.get('/contact/:id',validationRequest([commonSchema.idParam]),getContactTransactionHistory);
router.put('/profile/pin',validationRequest([authSchema.register[3]]),changePIN);
router.put('/profile/password',validationRequest([authSchema.register[2]]),changePassword);
router.delete('/delete-contact',validationRequest([contactSchema.create]),deleteContact);
router.post('/newcontact',validationRequest([contactSchema.create]),createNewContact);

module.exports = router;