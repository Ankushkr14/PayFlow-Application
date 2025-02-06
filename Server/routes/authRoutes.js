const express = require('express');
const router = express.Router();
const { authSchema } = require('../middlewares/schemaMiddleware');
const { register, login } = require('../controllers/authController');
const { validationRequest } = require('../middlewares/validationMiddleware');

router.post('/register', validationRequest(authSchema.register), register);
router.post('/login', validationRequest(authSchema.login), login);

module.exports = router;


