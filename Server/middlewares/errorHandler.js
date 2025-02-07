const logger = require('../utils/logger');
const { ValidationError, AuthenticationError, AuthorizationError, DatabaseError, InsufficientFundError, RateLimitError, NotFoundError } = require('../utils/error');

module.exports = (err, req, res, next)=>{
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details = {};

    if(err instanceof ValidationError){
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        details = err.error || {};
    }else if(err instanceof AuthenticationError){
        statusCode = 401;
        errorCode = 'AUTHENTICATION_ERROR';
        message = err.message || 'Authentication failed.';
    }else if(err instanceof AuthorizationError){
        statusCode = 403;
        errorCode = 'AUTHORIZATION_ERROR';
        message = err.message || 'Authorization failed';
    }else if(err instanceof DatabaseError){
        statusCode = 503;
        errorCode = 'DATABASE_ERROR';
        message = err.message || 'Database operation failed';
    }else if(err instanceof InsufficientFundError){
        statusCode = 402;
        errorCode = 'INSUFFICIENT_FUNDS';
        message = err.message || 'Insufficient balance.';
    }else if(err instanceof RateLimitError){
        statusCode = 429;
        errorCode = 'RATE_LIMIT_EXCEEDED';
        message = 'Too many requests';
    }else if(err instanceof NotFoundError){
        statusCode = 404;
        errorCode = 'NOT_FOUND_ERROR';
        message = err.message || 'Not Found';
    }


    if(statusCode === 500){
        logger.error('Unexpected error occured.',{
            error: err.stack || err.message,
            path: req.originalUrl,
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query,
        });
    }

    const response = {
        success: false,
        error: {
            code: errorCode,
            message: err.message,
            ...(Object.keys(details).length>0 && {details}),
        }
    }

    res.status(statusCode).json(response);

};