const winston = require('winston');
const { format } = winston;
const { combine, timestamp, json, printf, colorize } = format;

const logFormat = printf(({level, message, timestamp, stack})=>{
    return `${timestamp} [${level}] ${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV || 'info',
    format: combine(
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        format.errors({stack: true}),
        process.env.NODE_ENV === 'production' ? json() : combine(colorize(),logFormat)
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error'}),
        new winston.transports.File({ filename: 'logs/combined.log'})
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log'})
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections/js'})
    ]
})

module.exports = logger;