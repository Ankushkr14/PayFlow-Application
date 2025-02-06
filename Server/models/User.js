const db = require('../config/database');
const bcrypt = require('bcrypt');
const { DatabaseError, ValidationError, AuthorizationError, NotFoundError } = require('../utils/error');
const logger = require('../utils/logger');

// Create new user
const createUser = async ({name, email, password, pin})=>{
    try{
        
        if(!/^\d{4}$/.test(pin)){
            throw new ValidationError('Pin must be 4 digits.');
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const hashPin = await bcrypt.hash(pin,12);

        const [result] = await db.execute(
            `INSERT INTO user 
            (user_id, name, email, password_hash, pin_hash)
            VALUES (UUID(), ?, ?, ?, ?)`,
            [name, email,hashPassword, hashPin ]
        );

        if(!result || !result.insertId){
            throw new DatabaseError('User creation failed.', error);
        }
        return result;
    }catch(error){
        logger.error('User creation failed.', {error});
        if(error.code === 'ER_DUP_ENTRY')
            throw new ValidationError('Email already registered.');
        throw new DatabaseError("Failed to create new user.",error);
    }
}

const findUserByEmail = async (email)=>{
    try{
        const [rows] = await db.execute(
            `SELECT 
                user_id AS userId,
                name,
                email,
                password_hash AS passwordHash,
                pin_hash AS pinHash,
                balance,
                is_admin AS isAdmin
            FROM user 
            WHERE email = ?`,
            [email]
        );
        if(rows.length===0){
            return false;
        }

        return rows[0];
    }catch(error){
        logger.error('User lookup by email failed.', {email, error});
        throw new DatabaseError('Failed to find user by email.', error);
    }
}

const findUserById = async(userId)=>{
    try{
        const [row] = await db.execute(
            `SELECT 
            user_id AS userId,
            name,
            email,
            password_hash AS passwordHash,
            pin_hash AS pinHash,
            balance,
            is_admin AS isAdmin,
            status
            FROM user
            WHERE user_id = :userId`,
            { userId }
        );

        if(!row || row.length === 0){
            throw new ValidationError(`User not found by User ID: ${userId}`);
        }

        return row[0];
    }catch(error){
        logger.error('User lookup by ID failed.', {userId, error});
        throw new DatabaseError('Failed to find user by ID', error);
    }
}

const verifyUserPin = async(userId, pin)=>{
    try{
        const user = await findUserById(userId);
        const isValid = await bcrypt.compare(pin, user.pinHash);
        return isValid;
    }catch(error){
        logger.error('PIN verification failed.', {userId, error});
        throw new AuthorizationError('Incorrect PIN.', error);
    }
}

const updatePIN = async(userId, pin)=>{
    try{
        const user = await findUserById(userId);
        const [result] = await db.execute(
            `UPDATE user 
            SET pin_hash = :pin
            WHERE user_id = :userId`, {userId,pin}
        )
        if(result.affectedRows === 0){
            throw new ValidationError('PIN not changed.')
        }
        return true;
    }catch(error){
        logger.error('PIN not changed.', error);
        throw new DatabaseError('PIN change not successful.', error);
    }
}


const updatePassword = async(userId, password)=>{
    try{
        const [result] = await db.execute(
            `UPDATE user
            SET password_hash = :password
            WHERE user_id = :userId`, {userId, password}
        );
        if(result.affectedRows === 0){
            throw new ValidationError('Password not reset.');
        }
        return true;
    }catch(error){
        logger.error('Password not updated.',error);
        throw new DatabaseError('Password not changed.' ,error);
    }
}

const updateUserBalanceCredited = async (userId, amount)=>{
    try{
        const [result] = await db.execute(
            `UPDATE user
            SET balance = balance + :amount 
            WHERE user_id = :userId`,
            { userId, amount }
        );

        if(result.affectedRows === 0){
            throw new NotFoundError('User not found');
        }
        return await findUserById(userId);
    }catch(error){
        logger.error('Balance update failed.', {userId,amount,error});
        throw new DatabaseError('Failed to update user balance.', error);
    }
}

const updateUserBalanceDebited = async (userId, amount)=>{
    try{
        const [result] = await db.execute(
            `UPDATE user
            SET balance = balance - :amount 
            WHERE user_id = :userId`,
            { userId, amount }
        );

        if(result.affectedRows === 0){
            throw new NotFoundError('User not found');
        }

        return await findUserById(userId);
    }catch(error){
        logger.error('Balance update failed.', {userId,amount,error});
        throw new DatabaseError('Failed to update user balance.', error);
    }
}

const getUserTransactions = async(userId, page = 1, limit = 10)=>{
    try{
        const offset = (page-1)*limit;

        const [transactions] = await db.execute(
            `SELECT 
                t.id AS transactionId,
                t.sender_id AS senderId,
                t.receiver_id AS receiverId,
                t.amount,
                t.status,
                t.timestamp,
                s.name AS senderName,
                r.name AS receiverName
            FROM transactions t
            JOIN user s ON t.sender_id = s.user_id
            JOIN user r ON t.receiver_id = r.user_id
            WHERE t.sender_id = :userId OR t.receiver_id = :userId
            ORDER BY t.timestamp DESC
            LIMIT :limit OFFSET :offset`,
        { userId, limit, offset }
        );

        const [[{ total }]] = await db.execute(
            `SELECT COUNT(*) AS total
            FROM transactions
            WHERE sender_id = :userId OR receiver_id = :userId`,
            { userId }
        );

        return { transactions, pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total/limit)
        }};

    }catch(error){
        logger.error('Failed to get user transactions.', {userId, error});
        throw new DatabaseError('Failed to get transaction History.', error);
    }
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    verifyUserPin,
    updateUserBalanceCredited,
    updateUserBalanceDebited,
    getUserTransactions,
    updatePassword,
    updatePIN
};