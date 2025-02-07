const db = require('../config/database');
const { DatabaseError, ValidationError } = require('../utils/error');
const logger = require('../utils/logger');
const { updateUserBalanceDebited, updateUserBalanceCredited } = require('./User');

const createTransaction = async (senderId, receiverId, amount)=>{
    try{
        const [result] = await db.execute(
            `INSERT INTO transactions
            (sender_id, receiver_id,amount)
            VALUES (?,?,?)`,
            [ senderId, receiverId, amount ]
        );

        if (!result || !result.insertId) {
            throw new ValidationError('Transaction creation failed.');
        }
        return result;
    }catch(error){
        logger.error('Transaction creation failed', {senderId, receiverId, amount, error});
        throw new DatabaseError('Failed to create transaction. ',error);
    }
};


const getTransactionById = async(transactionId)=>{
    try{
        const [rows] = await db.execute(
            `SELECT
                t.id AS transactionId,
                t.sender_id AS sender_id,
                t.receiver_id AS receiver_id,
                t.amount,
                t.created_at,
                t.status,
                s.name AS senderName,
                COALESCE(r.name, 'ADMIN') AS receiverName  -- If receiver is NULL, use 'ADMIN'
            FROM transactions t
            JOIN user s ON t.sender_id = s.user_id
            LEFT JOIN user r ON t.receiver_id = r.user_id  -- Allow NULL for admin transactions
            WHERE t.id = ?;
            `, [transactionId]
        );

        if(rows.length === 0){
            return false;
        }
        return rows[0];
    }catch(error){
        console.log(error);
        logger.error('Failed to fetch the transaction.', {transactionId,error});
        throw new DatabaseError('Failed to get transactions.', error);
    }
};

const reverseTransaction = async(transactionId)=>{
    const connection = await db.getConnection();
    try{
        if(!getTransactionById(transactionId)){
            return false;
        }

        await connection.beginTransaction();

        const transaction = await getTransactionById(transactionId);
        const { sender_id,receiver_id,amount,status } = transaction;

        if(status === 'REVERSED'){
            throw new ValidationError('Transaction already reversed.');
        }
        const [receiverCurrent] = await db.execute(
            `SELECT balance FROM user WHERE id= ? FOR UPDATE`,[receiver_id]
        );
        if(receiverCurrent.balance < amount){
            throw new ValidationError(`Insufficient balance in receiver's account, Transaction reverse not executed.`);
        }

        const debitedStatus = await updateUserBalanceDebited(receiver_id, amount);
        if(!debitedStatus){
            throw new ValidationError('Receiver balance update failed.')
        }
        const creditedStatus = await updateUserBalanceCredited(sender_id,amount);
        if(!creditedStatus){
            throw new ValidationError('Sender balance update failed.')
        }

        const [updateTransaction] = await db.execute(
            `UPDATE transactions
            SET status = 'REVERSED'
            WHERE id = ?`, [transactionId]
        );
        if(updateTransaction.affectedRows === 0){
            throw new ValidationError('Failed to update the transaction status.');
        }

        await connection.commit();
        return true;
    }catch(error){
        console.log(error)
        logger.error('Transaction reversal failed.', {transactionId, error});
        throw new DatabaseError('Failed to reverse transaction.', error);

    }
}

const getTransaction = async(page = 1, limit = 10)=>{
    try{
        const offset = (page -1)*limit;
        const [transaction] = await db.execute(
            `SELECT 
                t.id AS transactionId,
                t.sender_id AS senderId,
                t.receiver_id AS receiverId,
                t.amount,
                t.created_at,
                s.name AS senderName,
                r.name AS receiverName,
                t.status
            FROM transactions t
            JOIN user s ON t.sender_id = s.user_id
            JOIN user r ON t.receiver_id = r.user_id
            ORDER BY t.created_at DESC`
        ) 
        if(!transaction){
            return false;
        }
        return transaction;
    }catch(error){
        logger.error("Failed to fetch transaction details.");
        throw new DatabaseError('Failed to fetch data.',error);
    }
}

const getTransactionByUserId = async(userId)=>{
    try{
        const [transaction] = await db.execute(
            `SELECT 
                    id AS transactionID, sender_id, receiver_id, amount, created_at 
                    FROM transactions 
                    WHERE sender_id = ? OR receiver_id = ?
                    ORDER BY created_at DESC`, [userId, userId]
        );
        if(transaction.length === 0){
            return false;
        }
        return transaction;
        
    }catch(error){
        logger.error('Failed to fetch the transaction Detials for the userId.',error);
        throw new DatabaseError("Failed to fetch transaction details by userID", error);
    }
}

module.exports = {
    createTransaction,
    getTransactionById,
    reverseTransaction, 
    getTransaction,
    getTransactionByUserId
}