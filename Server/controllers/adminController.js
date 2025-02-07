const admin = require("../models/admin");
const { getAllContact } = require("../models/contact");
const { reverseTransaction, getTransaction, getTransactionById } = require("../models/transactions");
const { findUserById, updateAmount } = require("../models/User");


const getUser = async(req,res,next)=>{
    try{
        const result = await admin.getAllUsers();
        res.status(200).json({
            success: true,
            message: 'All user details fetched successfully.',
            data: result.users,
        })
    }catch(error){
        next(error);
    }
};

const userDetail = async(req, res, next)=>{
    try{
        const userId = req.params.userId;
        const result = await admin.getUserDetails(userId);
        if(!result){
            res.status(400).json({
                success: true,
                message: 'User details not available.'
            })
        }
        res.status(200).json({
            success: true,
            message: 'User details fetched successfully.',
            data: result
        })
    }catch(error){
        next(error);
    }
};

const statusUpdate = async(req, res, next)=>{
    try{
        const userId = req.params.userId;
        const {status} = req.body;
        
        const result = await admin.updateUserStatus(userId,status);
        if(!result){
            return res.status(400).json({
                success: false,
                message: 'Failed to update status'
            })
        }
        res.status(201).json({
            success: true,
            message: `Account ${status} updated.`
        })
    }catch(error){
        next(error);
    }
}

const transactionReverse = async (req, res, next)=>{
    try{
        const transactionId = req.params.transactionId;
        const transactionUpdate = await reverseTransaction(transactionId);
        if(!transactionUpdate){
            return res.status(400).json({
                success: true,
                message: "No transaction found."
            })
        }
        res.status(201).json({
            success: true,
            message: 'Transaction reversed successfully.'
        })
    }catch(error){
        next(error);
    }
}

const system = async(req, res, next)=>{
    try{
        const status = await admin.systemStatus();
        if(!status){
            res.status(404).json({
                success: false,
                message: "Error in system."
            })
        }
        res.status(200).json({
            success: true,
            message: 'System status fetched successfully.',
            data: status
        })
    }catch(error){
        next(error);
    }
}

const deleteUser = async (req,res,next)=>{
    try{
        const userId = req.params.userId;
        const result = await admin.removeUser(userId);
        if(!result){
            res.status(400).json({
                success: false,
                message: 'Failed to delete user.'
            })
        }
        res.status(201).json({
            success: true,
            message: "user deleted successfully."
        })
    }catch(error){
        next(error);
    }
}

const getAllTransactions = async(req, res, next)=>{
    try{
        const transaction = await getTransaction();
        if(!transaction){
            res.status(400).json({
                success: true,
                message: "No transaction available."
            })
        }
        res.status(200).json({
            success: true,
            message: "Fetched all transaction successfully.",
            data: transaction
        })

    }catch(error){
        next(error);
    }
}

const transactionById = async(req, res, next)=>{
    try{
        const transactionId = req.params.transactionId;
        const detail = await getTransactionById(transactionId);
        if(!detail){
            return res.status(400).json({
                success: false,
                message: 'No transaction detail OR wrong transaction id.'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Transaction details fetched successfully.',
            transaction: detail
        })
    }catch(error){
        next(error);
    }
}
const getUserContacts = async (req, res, next)=>{
    try{
        const userId = req.params.userId;
        const contacts = await getAllContact(userId);
        if(!contacts){
            res.status(200).json({
                success: true,
                message: 'No contacts found.'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Contact found.',
            contact: contacts
        })
    }catch(error){
        next(error);
    }
}

const updatebalance = async(req, res, next)=>{
    try{
        const userId = req.params.userId
        const { balance } = req.body;
        const newBalance = Number(balance);
        if(newBalance<=0){
            return res.status(400).json({
                success: false, 
                message: 'Amount must be greater than 0.'
            })
        }
        const result = await updateAmount(userId, newBalance);
        if(!result){
            return res.status(400).json({
                success: false,
                message: "Failed to update balance."
            })
        }
        res.status(201).json({
            success: true,
            message: "Balance added successfully."
        })
    }catch(error){
        next(error);
    }
}

module.exports = {
    getUser,
    userDetail,
    statusUpdate,
    transactionReverse,
    system,
    deleteUser,
    getAllTransactions,
    transactionById,
    getUserContacts,
    updatebalance
}