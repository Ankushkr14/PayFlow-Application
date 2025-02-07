const { getUserTransactions } = require('../models/User');
const Moneytransfer = require('../services/transactionService');

const sendMoney = async (req, res, next)=>{
    try{
        const senderId = req.user.userId;
        const {receiverId, amount, pin} = req.body;
        const result = await Moneytransfer(senderId, receiverId, amount, pin);
        res.status(200).json({
            success: true,
            message: 'Transaction successful.',
            transactionId: result.transactionId,
            newBalance: result.newSenderBalance,
        })
    }catch(error){
        next(error);
    }
};

const getHistory = async(req, res, next)=>{
    try{

        const {page = 1, limit = 10} = req.query;
        const history = await getUserTransactions(req.user.user_id, parseInt(page), parseInt(limit));

        res.status(200).json({
            success: true,
            data: history.transactions,
            pagination: history.pagination
        })
    }catch(error){
        next(error);
    }
};

module.exports = {
    sendMoney, 
    getHistory
};
