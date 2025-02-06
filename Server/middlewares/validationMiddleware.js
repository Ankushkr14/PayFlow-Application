const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/error');
const logger = require('../utils/logger');


const validationRequest = (validation) => [
    ...validation,
    (req, res, next) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            logger.error('Validation Failed.', { error: error.array(),
                path: req.originalUrl,
                method: req.method,
                body: req.body, });
                return res.status(400).json({
                    success: false,
                    error: {
                      code: "VALIDATION_ERROR",
                      message: "Validation failed",
                      details: error.array() 
                    }
                  });
        }
        next();
    }
];


module.exports = { validationRequest};