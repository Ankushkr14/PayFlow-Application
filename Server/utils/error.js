class ApplicationError extends Error {
    constructor(message, statusCode = 500, errorCode ='INTERNAL_ERROR'){
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode
        Error.captureStackTrace(this, this.constructor);
    }
}

class DatabaseError extends ApplicationError{
    constructor(message, originalError){
        super(message, 500, 'DATABASE_ERROR');
        this.originalError = originalError;
    }
}

class ValidationError extends ApplicationError{
    constructor(message){
        super(message, 400, 'VALIDATION_ERROR');
    }
}

class AuthenticationError extends ApplicationError{
    constructor(message = 'Authentication_failed'){
        super(message, 401, 'APPLICATION_ERROR');
    }
}

class AuthorizationError extends ApplicationError{
    constructor(message = 'Unauthorized Access'){
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

class NotFoundError extends ApplicationError{
    constructor(resource = 'Resource'){
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

class RateLimitError extends ApplicationError{
    constructor(message = 'Too many requests'){
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}

class InsufficientFundError extends ApplicationError{
    constructor(){
        super('Insufficient balance', 400, 'INSUFFICIENT_FUNDS')
    }
}

module.exports = {
    ApplicationError,
    DatabaseError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    RateLimitError,
    InsufficientFundError
};