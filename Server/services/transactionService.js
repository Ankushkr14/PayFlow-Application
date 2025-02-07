const db = require('../config/database');
const { createTransaction } = require('../models/transactions');
const { findUserById, updateUserBalanceDebited, updateUserBalanceCredited, verifyUserPin } = require('../models/User');
const { ValidationError, InsufficientFundError, DatabaseError } = require('../utils/error');
const logger = require('../utils/logger');

const Moneytransfer = async (senderId, receiverId, amount, pin)=>{
    const connection = await db.getConnection();
    try{
        await connection.beginTransaction();
        const sender = await findUserById(senderId);
        const amountToTransafer = Number(amount);
        const senderBalance = Number(sender.balance);

        if(!(await verifyUserPin(senderId,pin))){
            throw new ValidationError('Invalid pin');
        }
        if(amountToTransafer>senderBalance){
            throw new InsufficientFundError();
        }

        await updateUserBalanceDebited(senderId, amountToTransafer);
        await updateUserBalanceCredited(receiverId,amountToTransafer);
        const transactionId =  await createTransaction(senderId,receiverId,amountToTransafer);
        if(!transactionId){
            return false;
        }
        await connection.commit();
        const newBalance = senderBalance - amountToTransafer;
        return {
            transactionId: transactionId.insertId,
            newSenderBalance : newBalance
        }
    }catch(error){
        await connection.rollback();
        logger.error('Transaction failed.',error);
        if (error instanceof ValidationError || error instanceof InsufficientFundError) {
            throw error;
        }
        throw new DatabaseError('Transaction processing failed',error);
    }
}

module.exports = Moneytransfer;