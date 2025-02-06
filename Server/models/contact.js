const db = require('../config/database');
const { DatabaseError, ValidationError, InsufficientFundError } = require('../utils/error');
const logger = require('../utils/logger');

const contactExists = async (userId, contactUserId)=>{
    const [[contact]] = await db.execute(
        `SELECT 1 FROM contacts 
        WHERE user_id = :userId
        AND contact_user_id = :contactUserId
        LIMIT 1`, {userId, contactUserId}
    );
    return !!contact;
};

const createContact = async (userId, contactUserId) => {
    try{
        const [[user]] = await db.execute(
            'SELECT user_id from user WHERE user_id = :contactUserId',{contactUserId}
        );
        if(!user){
            throw new ValidationError('user not found.');
        }
        if(await contactExists(userId, contactUserId)){
            throw new ValidationError('Contact already exists.');
        }
        const [result] = await db.execute(
            `INSERT INTO contacts(user_id, contact_user_id)
            VALUES(:userId, :contactUserId)`, {userId, contactUserId}
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
            u.user_id AS id
            u.name
            FROM contacts c 
            JOIN users u ON c.contact_user_id = u.user_id
            WHERE c.user_id = :userId`,{userId}
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
        const [[contact]] = await db.execute(
            `SELECT
            u.user_id AS id,
            u.name,
            u.email,
            (SELECT COUNT(*) FROM transactions
            WHERE (sender_id = :userId AND receiver_id = :contactId)
            OR (sender_id = :contactId AND receiver_id = :sender_id)
            FROM user u
            WHERE u.user_id = :contactId`,{userId, contactId}
        );

        if(!contact) throw new ValidationError('Contact not found');

        
        return contact;

    }catch(error){
        logger.error("Failed to get the contact details", {userId, contactId, error});
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
            WHERE user_id = :userId AND contact_id = :contactId`,{userId,contactId}
        )
        if(result.affectedRows === 0){
            return false;
        }
        
        return true;

    }catch(error){
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