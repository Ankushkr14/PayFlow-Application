const db = require('../config/database');
const { DatabaseError, ValidationError, InsufficientFundError } = require('../utils/error');
const logger = require('../utils/logger');
const { findUserById } = require('./User');

const contactExists = async (userId, contactUserId)=>{
    const [[contact]] = await db.execute(
        `SELECT 1 FROM contacts 
        WHERE user_id = ?
        AND contact_user_id = ?
        LIMIT 1`, [userId, contactUserId]
    );
    return !!contact;
};

const createContact = async (userId, contactUserId) => {
    try{
        const user = await findUserById(contactUserId);
        if(!user){
            throw new ValidationError('Contact Id  not found.');
        }
        if(await contactExists(userId, contactUserId)){
            throw new ValidationError('Contact already exists.');
        }
        const [result] = await db.execute(
            `INSERT INTO contacts(user_id, contact_user_id)
            VALUES(?, ?)`, [userId, contactUserId]
        );
        return {contactId: contactUserId};
    }catch(error){
        logger.error('Contact creation failed.', {userId, contactUserId, error});
        if(error.code = 'Er_DUP_ENTRY'){
            throw new ValidationError('Contact already exist.');
        }
        throw new DatabaseError('Failed to create contact', error);
    }
};

const getAllContact = async(userId)=>{
    try{
        const [contacts] = await db.execute(
            `SELECT
            u.user_id AS id,
            u.name
            FROM contacts c 
            JOIN user u ON c.contact_user_id = u.user_id
            WHERE c.user_id = ?`,[userId]
        );

        if(!contacts) return false;

        return contacts;
    }catch(error){
        logger.error(`Failed to fetch contact details for ${userId}`, error);
        throw new DatabaseError('Failed to fetch contacts', error);
    }
}

const getContactDetails = async (userId, contactId)=>{
    try{
        if(!(await contactExists(userId, contactId))){
            throw new ValidationError("Not in your contact.")
        }
        const [contact] = await db.execute(
            `SELECT 
                t.id, 
                t.sender_id, 
                t.receiver_id, 
                t.amount, 
                t.created_at
            FROM transactions t
            WHERE 
                (t.sender_id = ? AND t.receiver_id = ?)
                OR 
                (t.sender_id = ? AND t.receiver_id = ?)
            ORDER BY t.created_at DESC`,[userId, contactId,userId,contactId]
        );
        if(contact.length===0) 
            return false;
        return contact;

    }catch(error){
        logger.error("Failed to get the contact details", error);
        throw new DatabaseError('Failed to get contact details', error);

    }
};


const removeContact = async(userId, contactId)=>{
    try{
        if(!await contactExists(userId,contactId)){
            throw new ValidationError('No contact for this userID.')
        }
        const [result] = await db.execute(
            `DELETE FROM contacts
            WHERE user_id = ? AND contact_user_id = ?`,[userId,contactId]
        )
        if(result.affectedRows === 0){
            return false;
        }
        
        return true;

    }catch(error){
        console.log(error);
        logger.error('Failed to remove contact.',{userId,contactId, error});
        throw new DatabaseError('Failed to remove contact', error);
    }
}

module.exports = {
    createContact,
    getContactDetails,
    removeContact,
    getAllContact
}