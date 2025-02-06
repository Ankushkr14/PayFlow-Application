const db = require('../config/database');
const { DatabaseError, ValidationError } = require('../utils/error');
const logger = require('../utils/logger');

const createTransaction = async (senderId, receiverId, amount)=>{
    try{
        const [result] = await db.execute(
            `INSERT INTO transactions
            (sender_id, receiverId,amount)
            VALUES (:senderId,:receiverId,:amount)`,
            { senderId, receiverId, amount }
        );

        if(!result || result.insertId){
            throw new ValidationError('Transaction creation failed.');
        }
        return result.insertId;
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
            t.receiver_id AS recevier_id,
            t.amount,
            t.status,
            t.timestamp,
            s.name AS senderName,
            r.name AS receiverName
            FROM transactions t 
            JOIN user s ON t.sender_id = s.user_id
            JOIN user r ON t.receiver_id = r.user_id
            WHERE t.id = :transactionId`, {transactionId}
        );

        if(rows.length === 0){
            return false;
        }
        return rows[0];
    }catch(error){
        logger.error('Failed to fetch the transaction.', {transactionId,error});
        throw new DatabaseError('Failed to get transactions.', error);
    }
};

const reverseTransaction = async(transactionId)=>{
    try{
        if(!getTransactionById(transactionId)){
            return false;
        }

        await db.beginTransaction();

        const transaction = await getTransactionById(transactionId);
        const { sender_id,receiver_id,amount,status } = transaction;

        if(status === 'REVERSED'){
            throw new ValidationError('Transaction already reversed.');
        }
        const [receiverCurrent] = await db.execute(
            `SELECT balance FROM user WHERE id=:receiver_id FOR UPDATE`,{receiver_id}
        );
        if(receiverCurrent.balance < amount){
            throw new ValidationError(`Insufficient balance in receiver's account, Transaction reverse not executed.`);
        }

        const [deductedResult] = await db.execute(
            `UPDATE user
            SET balance = balance - :amount
            WHERE id = :receiver_id`, {amount, receiver_id}
        );

        if(deductedResult.affectedRows === 0){
            throw new ValidationError('Receiver balance update failed.');
        }
        
        const [creditResult] = await db.execute(
            `UPDATE user
            SET balance = balance + :amount
            WHERE id = :sender_id`,{amount, sender_id}
        )

        if(creditResult.affectedRows === 0){
            throw new ValidationError('Sender balance update failed.');
        }

        const [updateTransaction] = await db.execute(
            `UPDATE transactions
            SET status = 'REVERSED'
            WHERE id = :transactionId`, {transactionId}
        );
        if(updateTransaction.affectedRows === 0){
            throw new ValidationError('Failed to update the transaction status.');
        }

        await db.commit();
        return true;
    }catch(error){
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
                t.status,
                t.timestamp,
                s.name AS senderName,
                r.name AS receiverName
            FROM transactions t
            JOIN user s ON t.sender_id = s.user_id
            JOIN user r ON t.receiver_id = r.user_id
            ORDER BY t.timestamp DESC`
        ) 
        if(!transaction){
            return false;
        }
        return transaction;
    }catch(error){
        next(error);
    }
}

module.exports = {
    createTransaction,
    getTransactionById,
    reverseTransaction, 
    getTransaction,
}