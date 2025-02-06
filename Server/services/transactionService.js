const db = require('../config/database');
const { createTransaction } = require('../models/transactions');
const { findUserById, updateUserBalanceDebited, updateUserBalanceCredited } = require('../models/User');
const { ValidationError, InsufficientFundError, DatabaseError } = require('../utils/error');
const logger = require('../utils/logger');

const Moneytransfer = async (senderId, receiverId, amount, pin)=>{
    try{
        await db.beginTransaction();

        const sender = await findUserById(senderId);
        if(sender.balance < amount){
            throw new InsufficientFundError();
        }
        if(!(await verifyUserPin(senderId,pin))){
            throw new ValidationError('Invalid pin');
        }
        await updateUserBalanceDebited(senderId, amount);
        await updateUserBalanceCredited(receiverId,amount);
        const transactionId =  await createTransaction(senderId,receiverId,amount);

        await db.commit();
        const newBalance = sender.balance - amount;
        return {
            transactionId: transactionId,
            newSenderBalance : newBalance
        }
    }catch(error){
        await db.rollback();
        logger.error('Transaction failed.',error);
        throw new DatabaseError('Transaction processing failed',error);
    }
}

module.exports = Moneytransfer;