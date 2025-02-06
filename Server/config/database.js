const mysql2 = require('mysql2');
const logger = require('../utils/logger');

const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err,connection)=>{
    if(err){
        logger.error('Database Connection Error:',err);
    }

    logger.info('Connected to MySQL database.');
    console.log("Database connected successfully.");
    connection.release();
})

pool.on('error', (err)=>{
    logger.error('Database error: ',err);
})

const promisePool = pool.promise();

module.exports = promisePool;
