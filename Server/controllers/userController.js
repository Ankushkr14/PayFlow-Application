const { getAllContact, getContactDetails, removeContact, createContact } = require("../models/contact");
const { findUserById } = require("../models/User");
const { passwordReset, pinReset } = require("../services/authService");


const getProfile = async(req,res,next)=>{
    try{
        const userId = req.user.user_id;
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
        const userId = req.user.user_id;
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
        await passwordReset(email, oldPassword, newPassword);

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
        const {email, password, pin} = req.body;
        await pinReset(email, password, pin);

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
        const userId = req.user.user_id;
        const contact = await getContactDetails(userId, contactId);

        res.status(200).json({
            success: true,
            message: 'Contact details fetched successfully.',
            data: contact
        })
    }catch(error){
        next(error);
    }
}

const createNewContact = async(req, res, next)=>{
    try{
        const {contactUserId} = req.body;
        const userId = req.user.user_id;
        const contactId = await createContact(userId, contactUserId);
        res.status(201).json({
            success: true,
            message: 'Contact added successfully.',
            data: contactId
        })
    }catch(error){
        next(error);
    }
}

const deleteContact = async(req, res, next)=>{
    try{
        const userId = req.user.user_id;
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

module.exports = {
    getProfile,
    contactDetails,
    changePIN,
    changePassword,
    getContactTransactionHistory,
    createNewContact,
    deleteContact
}