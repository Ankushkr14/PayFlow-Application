const { body, param, query } = require('express-validator');

module.exports = {
  // Authentication schemas
  authSchema: {
    register: [
      body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email address'),
      body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
      body('pin')
        .isLength({ min: 4, max: 4 })
        .withMessage('PIN must be exactly 4 digits')
        .isNumeric()
        .withMessage('PIN must contain only numbers')
    ],
    login: [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email address'),
      body('password')
        .notEmpty()
        .withMessage('Password is required')
    ]
  },

  // Transaction schemas
  transactionSchema: {
    sendMoney: [
      body('receiverId')
        .isUUID(4)
        .withMessage('Invalid receiver ID format'),
      body('amount')
        .isFloat({ min: 1 })
        .withMessage('Amount must be at least ₹1'),
      body('pin')
        .isLength({ min: 4, max: 4 })
        .withMessage('PIN must be exactly 4 digits')
        .isNumeric()
        .withMessage('PIN must contain only numbers')
    ]
  },

  // Contact schemas
  contactSchema: {
    create: [
      body('contactId')
        .isUUID(4)
        .withMessage('Invalid contact ID format')
    ],
    sendMoney: [
      body('amount')
        .isFloat({ min: 1 })
        .withMessage('Amount must be at least ₹1'),
      body('pin')
        .isLength({ min: 4, max: 4 })
        .withMessage('PIN must be exactly 4 digits')
        .isNumeric()
        .withMessage('PIN must contain only numbers')
    ]
  },

  // Common schemas
  commonSchema: {
    pagination: [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
    ],
    idParam: [
      param('id')
        .isUUID(4)
        .withMessage('Invalid ID format')
    ]
  },

  // Admin schemas
  adminSchema: {
    freezeAccount: [
      body('status')
        .isIn(['active', 'frozen'])
        .withMessage('Status must be either active or frozen')
    ],
    reverseTransaction: [
      body('reason')
        .optional()
        .isString()
        .withMessage('Reason must be a string')
        .isLength({ max: 255 })
        .withMessage('Reason must be less than 255 characters')
    ]
  }
};