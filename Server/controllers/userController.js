const { getAllContact, getContactDetails, removeContact, createContact } = require("../models/contact");
const { getTransactionByUserId } = require("../models/transactions");
const { findUserById, getUserTransactions, findUserByEmail } = require("../models/User");
const { passwordReset, pinReset } = require("../services/authService");


const getProfile = async(req,res,next)=>{
    try{
        const userId = req.user.userId;
        const user = await findUserById(userId);
        res.status(200).json({
            success: true,
            message: `${user.name} data fetched successfully.`,
            data: {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                balance: user.balance,
            }
        })
    }catch(error){
        next(error);
    }
};

const contactDetails = async (req,res,next)=>{
    try{
        const userId = req.user.userId;
        const contactDetails = await getAllContact(userId);
        res.status(200).json({
            success: true,
            message: "Contact fetched successfully.",
            data: contactDetails
        });
    }catch(error){
        next(error);
    }
}

const changePassword = async (req,res,next) =>{
    try{
        const {email, oldPassword,newPassword} = req.body;
        const isUpdated = await passwordReset(email, oldPassword, newPassword);
        if(!isUpdated){
            return res.status(200).json({
                success: true,
                message: "Password not changed",
            })
        }
        res.status(201).json({
            success: true,
            message: 'Password changed successfully.'
        })
    }catch(error){
        next(error);
    }
}

const changePIN = async(req, res, next)=>{
    try{
        const {email, password, newPin} = req.body;
        await pinReset(email, password, newPin);

        res.status(201).json({
            success: true,
            message: 'PIN changed successfully.'
        })
    }catch(error){
        next(error);
    }
};

const getContactTransactionHistory = async(req,res,next)=>{
    try{
        const {contactId} = req.params;
        const userId = req.user.userId;
        const contact = await getContactDetails(userId, contactId);
        if(!contact){
            return res.status(200).json({
                success:true,
                message: "No transaction history",
                data: []
            })
        }
        res.status(200).json({
            success: true,
            message: 'Contact details fetched successfully.',
            data: contact,
        
        })
    }catch(error){
        next(error);
    }
}

const createNewContact = async(req, res, next)=>{
    try{
        const {contactId} = req.body;
        const userId = req.user.userId;
        const contactID = await createContact(userId, contactId);
        res.status(201).json({
            success: true,
            message: 'Contact added successfully.',
            data: contactID
        })
    }catch(error){
        next(error);
    }
}

const deleteContact = async(req, res, next)=>{
    try{
        const userId = req.user.userId;
        const {contactId} = req.body;
        const isDeleted = await removeContact(userId,contactId);
        if(!isDeleted){
            res.status(400).json({
                success: true,
                message: 'Contact not deleted.'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully.'
        })
    }catch(error){
        next(error);
    }
}
const getTransactionDetails = async(req, res, next)=>{
    try{
        const user = await findUserById(req.user.userId);
        const transactionHistory = await getTransactionByUserId(user.userId);
        if(!transactionHistory){
            return res.status(200).json({
                success: true,
                message: "No transaction details."
            })
        }
        res.status(200).json({
            success: true,
            message: "Transaction detailed fetched successfully.",
            data: transactionHistory,
        })
    }catch(error){
        console.log(error);
        next(error);
    }
}

module.exports = {
    getProfile,
    contactDetails,
    changePIN,
    changePassword,
    getContactTransactionHistory,
    createNewContact,
    deleteContact,
    getTransactionDetails
}